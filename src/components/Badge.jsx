import { Chip } from '@mui/material';

const colorMap = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  default: 'default',
};

export default function Badge({ label, status = 'default' }) {
  return <Chip label={label} color={colorMap[status] ?? 'default'} size="small" />;
}
