import sqlite3

conn = sqlite3.connect('app.db')
cursor = conn.cursor()

try:
    cursor.execute("DROP TABLE IF EXISTS produtos_servicos_historico_precos")
    print("Tabela removida")
    
    conn.commit()
    print("Banco de dados limpo com sucesso")
except Exception as e:
    print(f"Erro: {e}")
    conn.rollback()
finally:
    conn.close()
