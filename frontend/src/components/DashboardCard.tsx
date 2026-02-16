import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  subtitle?: string;
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  loading = false,
}) => {
  const borderClass = `border-left-${color}`;

  return (
    <div className={`card ${borderClass} shadow h-100 py-2`}>
      <div className="card-body">
        <div className="row no-gutters align-items-center">
          <div className="col mr-2">
            <div className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}>
              {title}
            </div>
            {loading ? (
              <div className="spinner-border spinner-border-sm text-gray-500" role="status">
                <span className="sr-only">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="h5 mb-0 font-weight-bold text-gray-800">{value}</div>
                {subtitle && <div className="text-xs text-gray-600 mt-1">{subtitle}</div>}
              </>
            )}
          </div>
          <div className="col-auto">
            <i className={`${icon} fa-2x text-gray-300`}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
