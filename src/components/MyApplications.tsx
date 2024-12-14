import React from 'react';
import { useMyApplications } from '../hooks/useMyApplications';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
  completed: 'info'
} as const;

export function MyApplications() {
  const { applications, loading, error } = useMyApplications();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">
          Error cargando las aplicaciones: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!applications.length) {
    return (
      <Box p={2}>
        <Alert severity="info">
          No tienes aplicaciones a trabajos todavía.
        </Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} p={2}>
      {applications.map((application) => (
        <Grid item xs={12} key={application.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h6" component="h2">
                  {application.job.title}
                </Typography>
                <Chip
                  label={application.status}
                  color={statusColors[application.status as keyof typeof statusColors] || 'default'}
                  size="small"
                />
              </Box>

              <Typography color="textSecondary" gutterBottom>
                {application.job.company_name}
              </Typography>

              <Typography variant="body2" color="textSecondary" paragraph>
                Presupuesto: ${application.job.budget}
              </Typography>

              {application.proposal && (
                <Typography variant="body2" paragraph>
                  <strong>Mi propuesta:</strong> {application.proposal}
                </Typography>
              )}

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="textSecondary">
                  Aplicado hace {formatDistanceToNow(new Date(application.created_at))}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Estado del trabajo: {application.job.status}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
