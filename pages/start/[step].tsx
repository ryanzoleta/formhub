import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import StartDataPage from '../../components/pages/data';
import StartFormsPage from '../../components/pages/forms';
import StartSummaryPage from '../../components/pages/summary';

function StartSteps() {
  const router = useRouter();

  const { step } = router.query;

  useEffect(() => {
    if (step === undefined) return;
    if (step !== 'forms' && step !== 'data' && step !== 'summary') router.push('/start/forms');
  }, [router.isReady]);

  if (step === 'forms') {
    return <StartFormsPage />;
  }
  if (step === 'data') {
    return <StartDataPage formsToCreate={['hello']} />;
  }
  if (step === 'summary') {
    return <StartSummaryPage />;
  }
}

export default StartSteps;
