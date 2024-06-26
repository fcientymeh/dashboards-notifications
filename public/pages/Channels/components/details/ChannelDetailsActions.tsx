/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiContextMenuItem,
  EuiPopover,
  EuiTextColor,
} from '@elastic/eui';
import { TextColor } from '@elastic/eui/src/components/text/text_color';
import React, { useContext, useState } from 'react';
import { ChannelItemType } from '../../../../../models/interfaces';
import { CoreServicesContext } from '../../../../components/coreServices';
import { ModalConsumer } from '../../../../components/Modal';
import { ServicesContext } from '../../../../services';
import { ROUTES } from '../../../../utils/constants';
import { DeleteChannelModal } from '../modals/DeleteChannelModal';
import { i18n } from '@osd/i18n';

interface ChannelDetailsActionsParams {
  label: string;
  disabled?: boolean;
  color?: TextColor;
  modal?: React.ReactNode;
  modalParams?: object;
  href?: string;
  action?: () => void;
}

interface ChannelDetailsActionsProps {
  channel: ChannelItemType;
}

export function ChannelDetailsActions(props: ChannelDetailsActionsProps) {
  const coreContext = useContext(CoreServicesContext)!;
  const servicesContext = useContext(ServicesContext)!;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const sendTestMessage = async () => {
    try {
      await servicesContext.notificationService.sendTestMessage(
        props.channel.config_id,
      );
      coreContext.notifications.toasts.addSuccess(
        i18n.translate('notification.notificationChannels.sendTestMessageSuccess', {
          defaultMessage:
          'Successfully sent a test message.',
          })
      );
    } catch (error) {
      coreContext.notifications.toasts.addError(error?.body || error, {
        title: i18n.translate('notification.notificationChannels.sendTestMessageErr', {
          defaultMessage:
          'Failed to send the test message.',
          }),
        toastMessage: i18n.translate('notification.notificationChannels.sendTestMessageDetailsErr', {
          defaultMessage:
          'View error details and adjust the channel settings.',
          }),
      });
    }
  };

  const actions: ChannelDetailsActionsParams[] = [
    {
      label: i18n.translate('notification.notificationChannels.editToken', {
        defaultMessage:
        'Edit',
        }),
      href: `#${ROUTES.EDIT_CHANNEL}/${props.channel.config_id}?from=details`,
    },
    {
      label: i18n.translate('notification.notificationChannels.sendTestMessage', {
        defaultMessage:
        'Send test message',
        }),
      disabled:
        !props.channel.config_id ||
        !props.channel.is_enabled,
      action: sendTestMessage,
    },
    {
      label: i18n.translate('notification.notificationChannels.deleteToken', {
        defaultMessage:
        'Delete',
        }),
      color: 'danger',
      modal: DeleteChannelModal,
      modalParams: {
        href: `#${ROUTES.CHANNELS}`,
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
                    selected: [props.channel],
                    ...(params.modalParams || {}),
                  });
                }
                if (params.href) location.assign(params.href);
                if (params.action) params.action();
              }}
            >
              {params.color ? (
                <EuiTextColor color={params.color}>{params.label}</EuiTextColor>
              ) : (
                params.label
              )}
            </EuiContextMenuItem>
          ))}
        </EuiPopover>
      )}
    </ModalConsumer>
  );
}
