"""
Middleware para logging de requisições
"""
import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para logar todas as requisições HTTP"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        """
        Intercepta requisições e adiciona logging
        """
        # Gerar ID único para a requisição
        request_id = str(time.time())
        
        # Log da requisição
        logger.info(
            f"Request {request_id} - {request.method} {request.url.path} - "
            f"Client: {request.client.host if request.client else 'unknown'}"
        )
        
        # Tempo de início
        start_time = time.time()
        
        try:
            # Processar requisição
            response: Response = await call_next(request)
            
            # Calcular tempo de processamento
            process_time = time.time() - start_time
            
            # Log da resposta
            logger.info(
                f"Response {request_id} - Status: {response.status_code} - "
                f"Time: {process_time:.3f}s"
            )
            
            # Adicionar header com tempo de processamento
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            # Log de erro
            process_time = time.time() - start_time
            logger.error(
                f"Error {request_id} - {request.method} {request.url.path} - "
                f"Time: {process_time:.3f}s - Error: {str(e)}",
                exc_info=True
            )
            raise


class ErrorLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para capturar e logar exceções não tratadas"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            logger.error(
                f"Unhandled exception: {type(e).__name__}: {str(e)}",
                exc_info=True,
                extra={
                    "method": request.method,
                    "url": str(request.url),
                    "client": request.client.host if request.client else "unknown"
                }
            )
            raise
