import React, { FunctionComponent } from 'react';
import { Card, Icon, Skeleton, Timeline } from 'antd';
import { contractTypes } from 'app/application/modules/company/resources/resource-contracts/contracts';
import moment from 'moment';
import { DateFormat } from 'app/application/components/date.format.component';
import { IResourceContract } from 'app/shared/model/resource-contract.model';
import { IProjectResource } from 'app/shared/model/project-resource.model';
import { IProject } from 'app/shared/model/project.model';

interface ITimelinesProps {
  resource: any;
  contracts: ReadonlyArray<IResourceContract>;
  projectResources: ReadonlyArray<IProjectResource>;
  projects: ReadonlyArray<IProject>;
}

const cardStyle = { padding: '4px 8px' };

export const ResourceHistoryTimeline: FunctionComponent<ITimelinesProps> = props => {
  const { resource, contracts, projectResources, projects } = props;

  const getTimeLines = () => {
    const timelines = [];
    if (resource.hireDate !== null) {
      timelines.push({
        color: 'grey',
        icon: 'flag',
        date: resource.hireDate,
        title: 'Embauche',
        tooltipTitle: "Date d'embauche"
      });
    }
    contracts.filter(contract => contract.resourceId === resource.id).map(contract => {
      const contractType = contractTypes.find(t => t.value === contract.type).label;
      timelines.push({
        color: 'blue',
        icon: 'caret-up',
        date: contract.startDate,
        title: 'Contrat',
        tooltipTitle: `Début de contrat "${contractType}"`
      });
      if (contract.endDate !== null) {
        timelines.push({
          color: 'red',
          icon: 'caret-down',
          date: contract.endDate,
          title: 'Contrat',
          tooltipTitle: `Fin du contrat "${contractType}"`
        });
      }
    });
    projectResources.map(projectResource => {
      if (projectResource) {
        const project = projects.find(p => p.id === projectResource.projectId);
        if (project) {
          timelines.push({
            color: 'green',
            date: projectResource.startDate,
            title: 'Contrat du projet',
            tooltipTitle: `Début de contrat du projet`,
            description: (
              <>
                project : <b>{project.nom}</b>
              </>
            )
          });
          if (projectResource.endDate !== null) {
            timelines.push({
              color: 'red',
              date: projectResource.endDate,
              title: 'Contrat du projet',
              tooltipTitle: `Fin du contrat de projet`,
              description: (
                <>
                  Projet : <b>{project.nom}</b>
                </>
              )
            });
          }
        }
      }
    });
    return timelines.sort((t1, t2) => (moment(t1.date).isBefore(t2.date, 'days') ? -1 : 0));
  };

  if (!resource || !resource.id) {
    return <Skeleton loading />;
  }
  return (
    <Timeline reverse mode="left" style={{ padding: '0 16px' }}>
      {getTimeLines().map((timeline, index) => (
        <Timeline.Item key={index} color={timeline.color} dot={timeline.icon && <Icon type={timeline.icon} />}>
          <small>
            <b>{timeline.title}</b>
          </small>
          <Card bodyStyle={cardStyle}>
            <small>
              <div>
                <b>{timeline.tooltipTitle}</b>
              </div>
              {timeline.description && <div>{timeline.description}</div>}
              <DateFormat value={timeline.date} />
            </small>
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};
