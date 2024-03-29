import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/router';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { DocumentReference } from 'firebase/firestore';
import PaperWithHeading from '../paper-with-heading';
import { Form } from '../../data/form';
import ProgressLine from '../progress-line';
import { UserData } from '../../data/user-data';
import { UserForm } from '../../data/user-form';
import initializeFirebase, { getStorageLink, uploadFile } from '../../common/firebase-utils';

interface Props {
  selectedForms: Array<Form>;
  userData: UserData;
  updateUserFormsCB: (userForms: Array<UserForm>) => void;
}

function StartSummaryPage({ selectedForms, userData, updateUserFormsCB }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const generateForms = async () => {
    setIsLoading(true);

    const data = {
      user_data: userData,
      forms: selectedForms.map((form) => form.ref?.id),
    };

    const userForms: Array<UserForm> = [];

    initializeFirebase();

    axios.post('http://127.0.0.1:5000/submission', data).then(async (response) => {
      await userData.create();

      const generatedForms = Array.from(response.data.generated_forms);
      await Promise.all(
        generatedForms.map(async (generatedForm: any) => {
          await axios
            .get(`http://127.0.0.1:5000${generatedForm.link}`, { responseType: 'blob' })
            .then(async (pdfResponse) => {
              const currentForm = selectedForms.find((form) => form.ref?.id === generatedForm.id);

              if (currentForm) {
                const userForm = new UserForm('', currentForm.ref as DocumentReference);
                await userForm.create();

                const blob = new Blob([pdfResponse.data]);
                const filename = `${userForm.ref?.id}.pdf`;
                const link = await uploadFile(blob, filename);

                userForm.link = link;
                await userForm.update();

                userForms.push(userForm);
              }
            });
        })
      ).finally(() => {
        updateUserFormsCB(userForms);
        setIsLoading(false);
        router.push('/start/download');
      });
    });
  };

  return (
    <Container maxWidth="sm">
      <Box marginTop={3} marginBottom={3}>
        <ProgressLine stage={3} />
      </Box>
      <Stack gap={3}>
        <PaperWithHeading heading="Summary">
          <Box>
            <Typography variant="body1">The following forms will be generated:</Typography>
            <FormGroup>
              {selectedForms.map((f) => (
                <FormControlLabel
                  key={f.name}
                  label={`${f.name} (${f.category})`}
                  control={<Checkbox defaultChecked />}
                />
              ))}
            </FormGroup>
          </Box>
        </PaperWithHeading>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button variant="outlined" fullWidth>
              Edit information
            </Button>
          </Grid>
          <Grid item xs={6}>
            {isLoading ? (
              <LoadingButton
                variant="contained"
                onClick={generateForms}
                loadingIndicator="Please wait..."
                loading
                fullWidth
              >
                Generate Forms
              </LoadingButton>
            ) : (
              <LoadingButton variant="contained" onClick={generateForms} fullWidth>
                Generate Forms
              </LoadingButton>
            )}
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

export default StartSummaryPage;
