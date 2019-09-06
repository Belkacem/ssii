import React, { FunctionComponent, useEffect, useState } from 'react';
import { Checkbox, Divider, Drawer, Form, Spin } from 'antd';
import { IPersistedConfiguration } from 'app/shared/model/persisted-configuration.model';

interface IAbsenceCalendarSettingsProps {
  visible: boolean;
  loading: boolean;
  configurations: ReadonlyArray<IPersistedConfiguration>;
  onClose: () => void;
  onSave: (name: string, value: boolean) => void;
}

export const AbsenceCalendarSettings: FunctionComponent<IAbsenceCalendarSettingsProps> = props => {
  const { loading = false, configurations } = props;
  const [visible, setVisible] = useState(false);

  const getBooleanConfiguration = (key_name: string): boolean => {
    const key = `user.absence.calendar.${key_name}`;
    const conf = configurations.find(c => c.key === key);
    return !!conf && conf.value === 'true';
  };
  const confShowInactive = getBooleanConfiguration('show_inactive');
  const confShowDraft = getBooleanConfiguration('show_draft');
  const confShowZeroAbsence = getBooleanConfiguration('show_zero_absences');
  const confShowMultiColor = getBooleanConfiguration('show_multi_color');
  const confShowDualColor = getBooleanConfiguration('show_dual_color');

  useEffect(
    () => {
      setVisible(props.visible);
    },
    [props.visible]
  );

  const handleClose = () => props.onClose();

  const handleConfigChange = ev => {
    props.onSave(ev.target.name, ev.target.checked);
  };

  return (
    <Drawer
      title={<small>Configuration de calendrier</small>}
      placement="right"
      onClose={handleClose}
      visible={visible}
      width={350}
      bodyStyle={{ padding: 0 }}
    >
      <Spin spinning={loading} size="small">
        <Divider orientation="left" className="margin-bottom-8" children="Filtrage des ressources" />
        <Form.Item className="padding-1rem no-margin">
          <Checkbox
            onChange={handleConfigChange}
            name="show_inactive"
            checked={confShowInactive}
            children={<small>Afficher les ressources désactivées</small>}
          />
        </Form.Item>
        <Form.Item className="padding-1rem no-margin">
          <Checkbox
            onChange={handleConfigChange}
            name="show_draft"
            checked={confShowDraft}
            children={<small>Afficher les ressources brouillon</small>}
          />
        </Form.Item>
        <Form.Item className="padding-1rem no-margin">
          <Checkbox
            onChange={handleConfigChange}
            name="show_zero_absences"
            checked={confShowZeroAbsence}
            children={<small>Afficher les ressources avec zéro absence</small>}
          />
        </Form.Item>
        <Divider orientation="left" className="margin-bottom-8" children="Affichage multi-couleurs (légende)" />
        <Form.Item className="padding-1rem no-margin">
          <Checkbox
            onChange={handleConfigChange}
            name="show_multi_color"
            checked={confShowMultiColor}
            children={<small>Afficher les absences en multi-couleurs</small>}
          />
        </Form.Item>
        <Form.Item className="padding-1rem no-margin">
          <Checkbox
            onChange={handleConfigChange}
            name="show_dual_color"
            checked={confShowDualColor}
            children={<small>Afficher les intercontrat avec couleur</small>}
            disabled={confShowMultiColor}
          />
        </Form.Item>
      </Spin>
    </Drawer>
  );
};
