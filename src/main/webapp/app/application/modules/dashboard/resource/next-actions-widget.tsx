import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Avatar, Card, Icon, List } from 'antd';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getCurrentStep } from 'app/application/common/utils/resource-utils';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as Holiday from 'app/entities/holiday/holiday.reducer';
import { isWeekend } from 'app/application/common/utils/absence-utils';

interface INextActionsWidgetProps extends StateProps, DispatchProps {}

const today = moment();

export const NextActionsWidget: FunctionComponent<INextActionsWidgetProps> = props => {
  const { absences, absenceTypes, holidays, resource } = props;
  const loading = props.loadingAbsences;
  useEffect(() => {
    props.getMyAbsences(0, 10, 'start,desc');
    props.getHolidays(0, 999, 'date,asc');
  }, []);

  const actions = [];

  if (getCurrentStep(resource) < 4) {
    actions.push({
      title: 'Informations manquantes',
      desc: <small>Certaines informations sur votre profil sont manquantes, veuillez les compléter SVP.</small>,
      icon: 'user',
      link: '/app/resource/create-profile'
    });
  }

  if (absences.length > 0) {
    const nextAbsence = [...absences].reverse().find(ab => today.isBefore(ab.start, 'days'));
    if (nextAbsence) {
      const absenceType = absenceTypes.find(type => type.id === nextAbsence.typeId);
      actions.push({
        title: 'Congés et Absences',
        desc: (
          <small>
            Votre prochaine absence de type "<b>{absenceType.type}</b>" dans <b>{moment(nextAbsence.start).from(today, true)}</b> pour{' '}
            <b>{nextAbsence.numberDays}</b> jour
          </small>
        ),
        icon: 'calendar',
        link: `/app/resource/absences`
      });
    }
    const currentAbsence = absences.find(ab => today.isBetween(ab.start, ab.end, 'days', '[]'));
    if (currentAbsence) {
      const absenceType = absenceTypes.find(type => type.id === currentAbsence.typeId);
      actions.push({
        title: 'Absence 🏖',
        desc: (
          <small>
            Il vous reste {today.from(currentAbsence.end, true)} pour votre absence actuelle de type "<b>{absenceType.type}</b>"
          </small>
        ),
        icon: 'carry-out'
      });
    }
  }

  if (holidays.length > 0) {
    const holiday = holidays.find(h => today.isSame(h.date, 'days'));
    if (holiday) {
      actions.push({
        title: 'Jour férié 🎉',
        desc: (
          <small>
            Aujourd'hui {today.format('dddd DD MMMM YYYY')} c'est un jour férié: "<b>{holiday.name}</b>"
          </small>
        ),
        icon: 'star'
      });
    }
  }

  if (isWeekend(today)) {
    actions.push({
      title: 'Weekend 🎉',
      desc: <small>Aujourd'hui {today.format('dddd DD MMMM YYYY')} c'est un week-end, alors ... Bon weekend !</small>,
      icon: 'smile'
    });
  }

  const renderActionItem = item => (
    <List.Item
      actions={
        !!item.link && [
          <Link key="open" to={item.link}>
            <Icon type="select" />
          </Link>
        ]
      }
    >
      <List.Item.Meta
        avatar={<Avatar shape="square" icon={item.icon} />}
        title={!!item.link ? <Link to={item.link}>{item.title}</Link> : item.title}
        description={item.desc}
      />
    </List.Item>
  );

  return (
    <Card title="À faire et Notification" size="small">
      <List loading={loading} itemLayout="horizontal" dataSource={actions} renderItem={renderActionItem} size="small" />
    </Card>
  );
};

const mapStateToProps = ({ application, absenceType, holiday }: IRootState) => ({
  resource: application.resource.current.entity,
  absences: application.absence.list.entities,
  loadingAbsences: application.absence.pending.loading,
  absenceTypes: absenceType.entities,
  holidays: holiday.entities
});

const mapDispatchToProps = {
  getHolidays: Holiday.getEntities,
  getMyAbsences: AbsenceExt.getByCurrentResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(NextActionsWidget);
