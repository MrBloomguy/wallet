import { useCallback, useEffect, useState } from 'react'
import cn from 'classnames'

import { useModals } from 'hooks'

import { ReactComponent as CopyIcon } from 'resources/icons/copy-new.svg'
import { ReactComponent as CloseIcon } from 'resources/icons/close.svg'
import { ReactComponent as ChromeWebStore } from 'resources/chrome-web-store.svg'
import { useToasts } from 'hooks/toasts'
import legendsImage from './images/legends-image.jpg'
import legendsImage2x from './images/legends-image@2x.jpg'

import styles from './MigrationModal.module.scss'

const CAN_CLOSE_AFTER_MS = 9400

const CONTENT = {
  withCode: {
    title: 'By using this version of Ambire you don’t receive XP in Ambire Legends',
    text: 'Migrate to the Ambire extension now and get airdrop:'
  },
  withoutCode: {
    title: 'This version of Ambire is no longer under active development',
    text: 'To receive Legends XP, continue using your Ambire extension now'
  }
}

const MigrationModal = ({ inviteCode, waitForClose = true }) => {
  const { hideModal } = useModals()
  const { addToast } = useToasts()
  const [remainingTime, setRemainingTime] = useState(CAN_CLOSE_AFTER_MS)
  const [canClose, setCanClose] = useState(!waitForClose)

  const handleCloseModal = useCallback(() => {
    if (!canClose) return

    hideModal()
  }, [canClose, hideModal])

  useEffect(() => {
    const startingTime = Date.now()

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startingTime
      const newRemainingTime = CAN_CLOSE_AFTER_MS - elapsedTime
      setRemainingTime(newRemainingTime)

      if (newRemainingTime <= 0) {
        setCanClose(true)
        clearInterval(interval)
      }
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      addToast('Invite code copied to clipboard')
    } catch {
      addToast('Failed to copy invite code to clipboard', { error: true })
    }
  }, [addToast, inviteCode])

  const { title, text } = CONTENT[inviteCode ? 'withCode' : 'withoutCode']

  return (
    <div className={`${styles.wrapper} ${styles[inviteCode ? 'withCode' : 'withoutCode']}`}>
      <div className={styles.header}>
        <img
          srcSet={`${legendsImage2x} 2x`}
          src={legendsImage}
          alt=""
          className={styles.headerImage}
        />
        <div
          className={cn(styles.closeWrapper, {
            [styles.closeIconEnabled]: canClose
          })}
        >
          {!canClose ? (
            <span className={styles.remainingTime}>
              {remainingTime > 500 ? Math.round(remainingTime / 1000) : 1}
            </span>
          ) : (
            <CloseIcon className={styles.closeIcon} onClick={handleCloseModal} />
          )}
        </div>
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.text}>{text}</p>
        {!!inviteCode && (
          <>
            <div className={styles.codeWrapper}>
              <span className={styles.codeTitle}>Invitation code</span>
              <span className={styles.code}>{inviteCode}</span>
              <button className={styles.copyButton} type="button" onClick={handleCopy}>
                <CopyIcon />
                <span>Copy</span>
              </button>
            </div>
            <div className={styles.storeWrapper}>
              <p className={styles.storeText}>
                Go to Chrome Web Store, install the extension and use the invitation code to log in.
              </p>
              <a
                className={styles.storeLink}
                href="https://chromewebstore.google.com/detail/ambire-wallet/ehgjhhccekdedpbkifaojjaefeohnoea"
                target="_blank"
                rel="noreferrer"
              >
                <ChromeWebStore />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MigrationModal
