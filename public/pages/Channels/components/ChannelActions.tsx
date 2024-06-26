/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiContextMenuItem, EuiPopover } from '@elastic/eui';
import React, { useContext, useState } from 'react';
import { SERVER_DELAY } from '../../../../common';
import { ChannelItemType } from '../../../../models/interfaces';
import { CoreServicesContext } from '../../../components/coreServices';
import { ModalConsumer } from '../../../components/Modal';
import { ServicesContext } from '../../../services';
import { ROUTES } from '../../../utils/constants';
import { DeleteChannelModal } from './modals/DeleteChannelModal';
import { MuteChannelModal } from './modals/MuteChannelModal';
import { i18n } from '@osd/i18n';

interface ChannelActionsParams {
  label: string;
  disabled: boolean;
  modal?: React.ReactNode;
  modalParams?: object;
  href?: string;
  action?: () => void;
}

interface ChannelActionsProps {
  selected: ChannelItemType[];
  setSelected: (items: ChannelItemType[]) => void;
  items: ChannelItemType[];
  setItems: (items: ChannelItemType[]) => void;
  refresh: () => void;
}

export function ChannelActions(props: ChannelActionsProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const actions: ChannelActionsParams[] = [
    {
      label: i18n.translate('notification.notificationChannels.editToken', {
        defaultMessage:
        'Edit',
        }),
      disabled: props.selected.length !== 1,
      href: `#${ROUTES.EDIT_CHANNEL}/${props.selected[0]?.config_id}`,
    },
    {
      label: i18n.translate('notification.notificationChannels.deleteToken', {
        defaultMessage:
        'Delete',
        }),
      disabled: props.selected.length === 0,
      modal: DeleteChannelModal,
      modalParams: { refresh: props.refresh },
    },
    {
      label: i18n.translate('notification.notificationChannels.actionMute', {
        defaultMessage:
        'Mute',
        }),
      disabled: props.selected.length !== 1 || !props.selected[0].is_enabled,
      modal: MuteChannelModal,
      modalParams: { refresh: props.refresh, setSelected: props.setSelected },
    },
    {
      label: i18n.translate('notification.notificationChannels.actionUnmute', {
        defaultMessage:
        'Unmute',
        }),
      disabled: props.selected.length !== 1 || props.selected[0].is_enabled,
      action: async () => {
        const channel = { ...props.selected[0], is_enabled: true };
        servicesContext.notificationService
          .updateConfig(channel.config_id, channel)
          .then((resp) => {
            coreContext.notifications.toasts.addSuccess(
              i18n.translate('notification.notificationChannels.channelUnmutedSuccess', {
                defaultMessage:
                `Channel ${channel.name} successfully unmuted.`,
                values:{name:channel.name}
                })
              
            );
            props.setSelected([channel]);
            setTimeout(() => props.refresh(), SERVER_DELAY);
          })
          .catch((error) => {
            coreContext.notifications.toasts.addError(error?.body || error, {
              title: i18n.translate('notification.notificationChannels.unmuteChannelErr', {
                defaultMessage:
                'Failed to unmute channel',
                }),
            });
          });
      },
    },
  ];

  return (
    <ModalConsumer>
      {({ onShow }) => (
        <EuiPopover
          panelPaddingSize="none"
          button={
            <EuiButton
              iconType="arrowDown"
              iconSide="right"
              disabled={props.selected.length === 0}
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            >
              {i18n.translate('notification.notificationChannels.channelsActions', {
              defaultMessage:
                'Actions',
              })}
            </EuiButton>
          }
          isOpen={isPopoverOpen}
          closePopover={() => setIsPopoverOpen(false)}
        >
          {actions.map((params) => (
            <EuiContextMenuItem
              key={params.label}
              disabled={params.disabled}
              onClick={() => {
                setIsPopoverOpen(false);
                if (params.modal) {
                  onShow(params.modal, {
                    selected: props.selected,
                    ...(params.modalParams || {}),
                  });
                }
                if (params.href) location.assign(params.href);
                if (params.action) params.action();
              }}
            >
              {params.label}
            </EuiContextMenuItem>
          ))}
        </EuiPopover>
      )}
    </ModalConsumer>
  );
}
