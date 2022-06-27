import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';

interface Props {
  children: ReactJSXElement;
}

function PaperWithHeading({ children }: Props) {
  return (
    <Paper variant="outlined">
      <Box padding={2}>
        <Typography variant="h6">Personal Data</Typography>
      </Box>

      <Divider />
      <Box padding={2}>{children}</Box>
    </Paper>
  );
}

export default PaperWithHeading;
