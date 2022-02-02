import React, { PureComponent } from 'react';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { makeCall } from '/imports/ui/services/api';
import { styles } from './styles.scss';
import ActionsDropdown from './actions-dropdown/container';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';
// import LocalesDropdown from '/imports/ui/components/locales-dropdown/component'; // for do commit
import { defineMessages } from 'react-intl'; // for do commit in injectIntl
import { ACTIONS, LAYOUT_TYPE } from '/imports/ui/components/layout/enums';
// import ApplicationMenu from '/imports/ui/components/settings/submenus/application/component'
// const MIN_FONTSIZE = 0; // for do commit
// const SHOW_AUDIO_FILTERS = (Meteor.settings.public.app
//   .showAudioFilters === undefined)
//   ? true
//   : Meteor.settings.public.app.showAudioFilters; // for do commit

const intlMessages = defineMessages({

  layoutOptionLabel: {
    id: 'app.submenu.application.layoutOptionLabel',
    description: 'layout options',
  },
  customLayout: {
    id: 'app.layout.style.custom',
    description: 'label for custom layout style',
  },
  smartLayout: {
    id: 'app.layout.style.smart',
    description: 'label for smart layout style',
  },
  presentationFocusLayout: {
    id: 'app.layout.style.presentationFocus',
    description: 'label for presentationFocus layout style',
  },
  videoFocusLayout: {
    id: 'app.layout.style.videoFocus',
    description: 'label for videoFocus layout style',
  },
  presentationFocusPushLayout: {
    id: 'app.layout.style.presentationFocusPush',
    description: 'label for presentationFocus layout style (push to all)',
  },
  videoFocusPushLayout: {
    id: 'app.layout.style.videoFocusPush',
    description: 'label for videoFocus layout style (push to all)',
  },
  smartPushLayout: {
    id: 'app.layout.style.smartPush',
    description: 'label for smart layout style (push to all)',
  },
  customPushLayout: {
    id: 'app.layout.style.customPush',
    description: 'label for custom layout style (push to all)',
  },
  settingsLabel: {
    id: 'app.navBar.settingsDropdown.settingsLabel',
    description: 'Open settings option label',
  },
});

class ActionsBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // settingsName: 'application', // for do commits
      settings: props.settings,
      // isLargestFontSize: false,  // for do commits
      // isSmallestFontSize: false,
      // showSelect: false,
      // fontSizes: [
      //   '12px',
      //   '14px',
      //   '16px',
      //   '18px',
      //   '20px',
      // ], // for do commits
    };

    // Set the logout code to 680 because it's not a real code and can be matched on the other side
    this.LOGOUT_CODE = '680';

    this.leaveSession = this.leaveSession.bind(this);
  }

  handleSelectChange(fieldname, e) {
    const obj = this.state;
    obj.settings[fieldname] = e.target.value;
    this.handleUpdateSettings('application', obj.settings);
  }

  leaveSession() {
    makeCall('userLeftMeeting');
    // we don't check askForFeedbackOnLogout here,
    // it is checked in meeting-ended component
    Session.set('codeError', this.LOGOUT_CODE);
  }

  changeFontSize(size) {
    const { layoutContextDispatch } = this.props;
    const obj = this.state;
    obj.settings.fontSize = size;
    // this.setState(obj, () => {
    //   ApplicationMenu.setHtmlFontSize(this.state.settings.fontSize); // for do commit
    //   this.handleUpdateFontSize(this.state.settings.fontSize);
    // });for do commit

    layoutContextDispatch({
      type: ACTIONS.SET_FONT_SIZE,
      value: parseInt(size.slice(0, -2), 10),
    });
  }

  renderChangeLayout() {
    const { intl, isModerator } = this.props;
    const { settings } = this.state;

    if (isModerator) {
      const pushLayouts = {
        CUSTOM_PUSH: 'customPush',
        SMART_PUSH: 'smartPush',
        PRESENTATION_FOCUS_PUSH: 'presentationFocusPush',
        VIDEO_FOCUS_PUSH: 'videoFocusPush',
      };
      Object.assign(LAYOUT_TYPE, pushLayouts);
    }
    return (
      <>
        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.formElement}>
              <label htmlFor="layoutList" className={styles.label}>
                {intl.formatMessage(intlMessages.layoutOptionLabel)}
              </label>
            </div>
          </div>
          <div className={styles.col}>
            <div className={cx(styles.formElement, styles.pullContentRight)}>
              <select
                className={styles.select}
                onChange={(e) => this.handleSelectChange('selectedLayout', e)}
                id="layoutList"
                value={settings.selectedLayout}
              >
                {
                  Object.values(LAYOUT_TYPE)
                    .map((layout) => <option key={layout} value={layout}>{intl.formatMessage(intlMessages[`${layout}Layout`])}</option>)
                }
              </select>
            </div>
          </div>
        </div>
      </>
    );
  }

  render() {
    const {
      amIPresenter,
      amIModerator,
      enableVideo,
      isLayoutSwapped,
      toggleSwapLayout,
      handleTakePresenter,
      intl,
      isSharingVideo,
      hasScreenshare,
      stopExternalVideoShare,
      isCaptionsAvailable,
      isMeteorConnected,
      isPollingEnabled,
      isSelectRandomUserEnabled,
      isRaiseHandButtonEnabled,
      isPresentationDisabled,
      isThereCurrentPresentation,
      allowExternalVideo,
      setEmojiStatus,
      currentUser,
      shortcuts,
      layoutContextDispatch,
      actionsBarStyle,
      isOldMinimizeButtonEnabled,
    } = this.props;

    const {
      allowLogout: allowLogoutSetting,
    } = Meteor.settings.public.app;

    return (
      <div
        className={styles.actionsbar}
        style={
          {
            height: actionsBarStyle.innerHeight,
          }
        }
      >

        <div className={styles.left}>

          <ActionsDropdown {...{
            amIPresenter,
            amIModerator,
            isPollingEnabled,
            isSelectRandomUserEnabled,
            allowExternalVideo,
            handleTakePresenter,
            intl,
            isSharingVideo,
            stopExternalVideoShare,
            isMeteorConnected,
          }}
          />

          {isRaiseHandButtonEnabled
            ? (
              <Button
                icon="hand"
                label={intl.formatMessage({
                  id: `app.actionsBar.emojiMenu.${
                    currentUser.emoji === 'raiseHand'
                      ? 'lowerHandLabel'
                      : 'raiseHandLabel'
                  }`,
                })}
                accessKey={shortcuts.raisehand}
                color={currentUser.emoji === 'raiseHand' ? 'primary' : 'default'}
                data-test={currentUser.emoji === 'raiseHand' ? 'lowerHandLabel' : 'raiseHandLabel'}
                ghost={currentUser.emoji !== 'raiseHand'}
                className={cx(currentUser.emoji === 'raiseHand' || styles.btn)}
                hideLabel
                circle
                size="lg"
                onClick={() => {
                  setEmojiStatus(
                    currentUser.userId,
                    currentUser.emoji === 'raiseHand' ? 'none' : 'raiseHand',
                  );
                }}
              />
            )
            : null}
          {isCaptionsAvailable
            ? (
              <CaptionsButtonContainer {...{ intl }} />
            )
            : null}
          {!isOldMinimizeButtonEnabled
            || (isOldMinimizeButtonEnabled && isLayoutSwapped && !isPresentationDisabled)
            ? (
              <PresentationOptionsContainer
                isLayoutSwapped={isLayoutSwapped}
                toggleSwapLayout={toggleSwapLayout}
                layoutContextDispatch={layoutContextDispatch}
                hasPresentation={isThereCurrentPresentation}
                hasExternalVideo={isSharingVideo}
                hasScreenshare={hasScreenshare}
              />
            )
            : null}
          <ScreenshareButtonContainer {...{
            amIPresenter,
            isMeteorConnected,
          }}
          />
        </div>
        <div className={styles.center}>
          <AudioControlsContainer />
          {enableVideo
            ? (
              <JoinVideoOptionsContainer />
            )
            : null}
        </div>
        <div className={styles.right}>
          {allowLogoutSetting && isMeteorConnected
            ? (
              <Button
                icon="logout"
                label={intl.formatMessage({
                  id: 'app.navBar.settingsDropdown.leaveSessionLabel',
                })}
                accessKey={shortcuts.leaveSession}
                color="danger"
                data-test="leaveSessionLabel"
                ghost={false}
                className={styles.button}
                hideLabel
                circle
                size="lg"
                onClick={() => this.leaveSession()}
              />
            )
            : null}
        </div>

      </div>
    );
  }
}

export default withShortcutHelper(ActionsBar, ['raiseHand']);
