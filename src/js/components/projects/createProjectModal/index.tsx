import Button from '@salesforce/design-system-react/components/button';
import Modal from '@salesforce/design-system-react/components/modal';
import ProgressIndicator from '@salesforce/design-system-react/components/progress-indicator';
import { t } from 'i18next';
import React, { useState } from 'react';

import CreateProjectForm from '@/js/components/projects/createProjectModal/form';
import {
  LabelWithSpinner,
  useForm,
  useFormDefaults,
  useIsMounted,
} from '@/js/components/utils';
import { Project } from '@/js/store/projects/reducer';
import { OBJECT_TYPES } from '@/js/utils/constants';

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

export interface CreateProjectData
  extends Pick<Project, 'name' | 'description' | 'repo_name' | 'github_users'> {
  organization: string;
  dependencies: string[];
}

const CreateProjectModal = ({ isOpen, closeModal }: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const isMounted = useIsMounted();
  const [isSaving, setIsSaving] = useState(false);

  const orgs: string[] = [];

  const nextPage = () => {
    setPageIndex(pageIndex + 1);
  };

  const prevPage = () => {
    setPageIndex(pageIndex - 1 || 0);
  };

  const handleSuccess = () => {
    /* istanbul ignore else */
    if (isMounted.current) {
      setIsSaving(false);
      closeModal();
      setPageIndex(0);
    }
  };

  /* istanbul ignore next */
  const handleError = () => {
    if (isMounted.current) {
      setIsSaving(false);
    }
  };

  const defaultOrganization = orgs[0] || '';

  const {
    inputs,
    errors,
    handleInputChange,
    setInputs,
    handleSubmit,
    resetForm,
  } = useForm({
    fields: {
      name: '',
      description: '',
      repo_name: '',
      github_users: [],
      organization: defaultOrganization,
      dependencies: [],
    } as CreateProjectData,
    objectType: OBJECT_TYPES.PROJECT,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const canSubmit = Boolean(
    inputs.name && inputs.organization && inputs.repo_name,
  );

  const handleClose = () => {
    closeModal();
    setPageIndex(0);
    resetForm();
  };

  // When default organization changes, update selection
  useFormDefaults({
    field: 'organization',
    value: defaultOrganization,
    inputs,
    setInputs,
  });

  // When project name changes, update repo_name
  useFormDefaults({
    field: 'repo_name',
    value: inputs.name.replace(/[^A-Za-z0-9_.-]/g, '-').substring(0, 100),
    inputs,
    setInputs,
  });

  const doSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsSaving(true);
    handleSubmit(e as any);
  };

  const CancelBtn = (args: any) => (
    <Button
      label={t('Cancel')}
      onClick={handleClose}
      disabled={isSaving}
      {...args}
    />
  );

  const BackBtn = (args: any) => (
    <Button
      label={t('Go Back')}
      variant="outline-brand"
      onClick={prevPage}
      {...args}
    />
  );

  const NextBtn = (args: any) => (
    <Button
      label={t('Save & Next')}
      variant="brand"
      onClick={nextPage}
      {...args}
    />
  );

  const steps = [
    { id: 0, label: t('Enter Project Details') },
    { id: 1, label: t('Add Project Collaborators') },
    { id: 2, label: t('Add Dependencies') },
    { id: 3, label: t('Create Project') },
  ];

  const Progress = (
    <ProgressIndicator
      steps={steps}
      completedSteps={steps.slice(0, pageIndex)}
      disabledSteps={canSubmit ? [] : steps.slice(1)}
      selectedStep={steps[pageIndex]}
      variant="modal"
    />
  );

  const pages = [
    {
      heading: t('Create Project'),
      contents: (
        <CreateProjectForm
          inputs={inputs as CreateProjectData}
          errors={errors}
          handleInputChange={handleInputChange}
        />
      ),
      footer: (
        <div className="slds-grid slds-grid_align-spread">
          <CancelBtn />
          {Progress}
          <NextBtn disabled={!canSubmit} />
        </div>
      ),
    },
    {
      heading: t('Add Project Collaborators'),
      contents: (
        <div className="slds-p-around_large">This is a placeholder.</div>
      ),
      footer: (
        <div className="slds-grid slds-grid_align-spread">
          <BackBtn />
          {Progress}
          <NextBtn />
        </div>
      ),
    },
    {
      heading: t('Add Dependencies'),
      contents: (
        <div className="slds-p-around_large">This is a placeholder.</div>
      ),
      footer: (
        <div className="slds-grid slds-grid_align-spread">
          <BackBtn />
          {Progress}
          <NextBtn />
        </div>
      ),
    },
    {
      heading: t('Create Project'),
      contents: (
        <div className="slds-p-around_large">This is a placeholder.</div>
      ),
      footer: (
        <div className="slds-grid slds-grid_align-spread">
          <BackBtn />
          {Progress}
          <Button
            key="submit"
            label={
              isSaving ? (
                <LabelWithSpinner label={t('Creating…')} variant="inverse" />
              ) : (
                t('Create Project')
              )
            }
            variant="brand"
            onClick={doSubmit}
            disabled={isSaving}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      size="small"
      disableClose={isSaving}
      heading={pages[pageIndex].heading}
      assistiveText={{ closeButton: t('Cancel') }}
      footer={pages[pageIndex].footer}
      onRequestClose={handleClose}
    >
      {pages[pageIndex].contents}
    </Modal>
  );
};

export default CreateProjectModal;
