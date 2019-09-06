import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Progress, Steps } from 'antd';

export interface IStepProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  content: string | ReactNode;
}

interface IStepsPageProps {
  steps: IStepProps[];
  current: number;
  onNavigate?: (step: number) => void;
  showSteps?: boolean;
}

const StepsPage: FunctionComponent<IStepsPageProps> = props => {
  const [currentStep, setCurrentStep] = useState(0);
  const [percent, setPercent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 480px)');
    mql.addListener(mqlListener);
    mqlListener(mql);
    return () => {
      mql.removeListener(mqlListener);
    };
  }, []);

  useEffect(
    () => {
      setCurrentStep(props.current);
      setPercent(Math.floor(((props.current + 1) * 100) / props.steps.length));
    },
    [props.current]
  );

  const mqlListener = ev => setIsMobile(ev.matches);

  const formatProgress = () => `${currentStep + 1}/${steps.length}`;
  const handleNavigate = step => props.onNavigate(step);

  const { steps, onNavigate, showSteps = true } = props;
  const Step: any = Steps.Step;
  return (
    <>
      {showSteps && (
        <div className="steps-page">
          {isMobile ? (
            <>
              <Progress
                type="circle"
                percent={percent}
                format={formatProgress}
                width={40}
                strokeWidth={12}
                style={{ paddingRight: 8, float: 'left' }}
              />
              <div>
                <h3 style={{ marginBottom: '-6px' }}>{steps[currentStep].title}</h3>
                {steps[currentStep].description}
              </div>
            </>
          ) : (
            <Steps direction="horizontal" current={currentStep} size="small" status="process">
              {steps.map((step, index) => (
                <Step
                  key={index}
                  title={index === currentStep && <b>{step.title}</b>}
                  description={index === currentStep && step.description && <small>{step.description}</small>}
                  onClick={!!onNavigate ? handleNavigate.bind(null, index) : null}
                  className={!!onNavigate ? 'cursor-pointer' : ''}
                />
              ))}
            </Steps>
          )}
        </div>
      )}
      {steps[currentStep].content}
    </>
  );
};

export default StepsPage;
