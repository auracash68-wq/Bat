import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  BannerAdPluginEvents,
  AdOptions,
  InterstitialAdPluginEvents,
  RewardAdOptions,
  RewardAdPluginEvents,
  AdMobRewardItem,
} from '@capacitor-community/admob';

/**
 * Official Google AdMob Android Test App ID and Ad Unit IDs.
 * Replace these constants in a future production release when ready.
 */
export const ADMOB_TEST_CONFIG = {
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  BANNER_AD_UNIT_ID: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL_AD_UNIT_ID: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED_AD_UNIT_ID: 'ca-app-pub-3940256099942544/5224354917',
  INTERSTITIAL_FREQUENCY: 3, // Show 1 interstitial every 3 completed game sessions
} as const;

export interface RewardResult {
  rewarded: boolean;
  errorMessage?: string;
}

export class AdMobManager {
  private static instance: AdMobManager;

  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private isBannerVisible: boolean = false;
  private isBannerLoading: boolean = false;
  private isBannerPrepared: boolean = false;

  private isInterstitialLoaded: boolean = false;
  private isInterstitialLoading: boolean = false;

  private isRewardedLoaded: boolean = false;
  private isRewardedLoading: boolean = false;

  private isFullScreenAdShowing: boolean = false;
  private completedSessionsCount: number = 0;

  private listenerHandles: PluginListenerHandle[] = [];

  private constructor() {}

  public static getInstance(): AdMobManager {
    if (!AdMobManager.instance) {
      AdMobManager.instance = new AdMobManager();
    }
    return AdMobManager.instance;
  }

  public isNativeAdSupported(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  }

  /**
   * Initializes Google Mobile Ads SDK safely once without blocking UI or gameplay.
   */
  public async initialize(): Promise<void> {
    if (!this.isNativeAdSupported()) {
      return;
    }
    if (this.isInitialized || this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    try {
      await AdMob.initialize({
        initializeForTesting: true,
      });
      this.isInitialized = true;
      await this.registerBaseListeners();
      // Preload interstitial & rewarded ads in background
      void this.preloadInterstitial();
      void this.preloadRewarded();
    } catch {
      // Fail gracefully if device is offline or Play Services is unavailable
      this.isInitialized = false;
    } finally {
      this.isInitializing = false;
    }
  }

  private async registerBaseListeners(): Promise<void> {
    try {
      await this.cleanupListeners();

      const h1 = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        this.isBannerLoading = false;
        this.isBannerPrepared = true;
      });

      const h2 = await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => {
        this.isBannerLoading = false;
        this.isBannerVisible = false;
      });

      const h3 = await AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        this.isInterstitialLoaded = true;
        this.isInterstitialLoading = false;
      });

      const h4 = await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => {
        this.isInterstitialLoaded = false;
        this.isInterstitialLoading = false;
      });

      const h5 = await AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
        this.isFullScreenAdShowing = true;
      });

      const h6 = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        this.isFullScreenAdShowing = false;
        this.isInterstitialLoaded = false;
        void this.preloadInterstitial();
      });

      const h7 = await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
        this.isFullScreenAdShowing = false;
        this.isInterstitialLoaded = false;
      });

      const h8 = await AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        this.isRewardedLoaded = true;
        this.isRewardedLoading = false;
      });

      const h9 = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        this.isRewardedLoaded = false;
        this.isRewardedLoading = false;
      });

      this.listenerHandles.push(h1, h2, h3, h4, h5, h6, h7, h8, h9);
    } catch {
      // Ignore listener registration errors
    }
  }

  /**
   * Displays the bottom adaptive banner ONLY on the Home (READY) screen.
   */
  public async showHomeBanner(): Promise<void> {
    if (!this.isNativeAdSupported()) return;

    if (!this.isInitialized) {
      await this.initialize();
      if (!this.isInitialized) return;
    }

    if (this.isBannerVisible || this.isBannerLoading) {
      return;
    }

    try {
      if (this.isBannerPrepared) {
        await AdMob.resumeBanner();
        this.isBannerVisible = true;
        return;
      }

      this.isBannerLoading = true;
      const options: BannerAdOptions = {
        adId: ADMOB_TEST_CONFIG.BANNER_AD_UNIT_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true,
      };
      await AdMob.showBanner(options);
      this.isBannerPrepared = true;
      this.isBannerVisible = true;
    } catch {
      this.isBannerVisible = false;
    } finally {
      this.isBannerLoading = false;
    }
  }

  /**
   * Hides the bottom banner immediately when leaving the Home screen (e.g. during active gameplay).
   */
  public async hideBanner(): Promise<void> {
    if (!this.isNativeAdSupported()) return;
    if (!this.isBannerVisible && !this.isBannerPrepared) return;

    try {
      await AdMob.hideBanner();
    } catch {
      // Ignore hide errors if banner was not rendered
    } finally {
      this.isBannerVisible = false;
    }
  }

  /**
   * Preloads an interstitial test ad in the background.
   */
  public async preloadInterstitial(): Promise<void> {
    if (!this.isNativeAdSupported() || !this.isInitialized) return;
    if (this.isInterstitialLoaded || this.isInterstitialLoading) return;

    this.isInterstitialLoading = true;
    try {
      const options: AdOptions = {
        adId: ADMOB_TEST_CONFIG.INTERSTITIAL_AD_UNIT_ID,
        isTesting: true,
      };
      await AdMob.prepareInterstitial(options);
      this.isInterstitialLoaded = true;
    } catch {
      this.isInterstitialLoaded = false;
    } finally {
      this.isInterstitialLoading = false;
    }
  }

  /**
   * Called on Game Over. Enforces frequency control (1 interstitial every 3 completed sessions)
   * and ensures no overlapping full-screen ads are displayed.
   */
  public async onGameSessionCompleted(): Promise<void> {
    this.completedSessionsCount += 1;

    if (!this.isNativeAdSupported()) return;
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Frequency check: Only display after every 3rd completed game session
    if (this.completedSessionsCount % ADMOB_TEST_CONFIG.INTERSTITIAL_FREQUENCY !== 0) {
      if (!this.isInterstitialLoaded) {
        void this.preloadInterstitial();
      }
      return;
    }

    if (this.isFullScreenAdShowing) {
      return;
    }

    try {
      if (!this.isInterstitialLoaded) {
        await this.preloadInterstitial();
      }
      if (this.isInterstitialLoaded && !this.isFullScreenAdShowing) {
        this.isFullScreenAdShowing = true;
        await AdMob.showInterstitial();
      }
    } catch {
      this.isFullScreenAdShowing = false;
      this.isInterstitialLoaded = false;
    }
  }

  /**
   * Preloads a rewarded video test ad in the background.
   */
  public async preloadRewarded(): Promise<void> {
    if (!this.isNativeAdSupported() || !this.isInitialized) return;
    if (this.isRewardedLoaded || this.isRewardedLoading) return;

    this.isRewardedLoading = true;
    try {
      const options: RewardAdOptions = {
        adId: ADMOB_TEST_CONFIG.REWARDED_AD_UNIT_ID,
        isTesting: true,
      };
      await AdMob.prepareRewardVideoAd(options);
      this.isRewardedLoaded = true;
    } catch {
      this.isRewardedLoaded = false;
    } finally {
      this.isRewardedLoading = false;
    }
  }

  /**
   * Shows a Rewarded Test Ad when the player explicitly taps "Watch Ad to Revive".
   * Resolves with `{ rewarded: true }` ONLY if Google's Rewarded callback confirms completion.
   */
  public async showRewardedAdForRevive(): Promise<RewardResult> {
    if (this.isFullScreenAdShowing) {
      return {
        rewarded: false,
        errorMessage: 'An advertisement is already active. Please try again in a moment.',
      };
    }

    if (!this.isNativeAdSupported()) {
      return {
        rewarded: false,
        errorMessage: 'Rewarded test ads are only available in the Android app build.',
      };
    }

    if (!this.isInitialized) {
      await this.initialize();
      if (!this.isInitialized) {
        return {
          rewarded: false,
          errorMessage: 'Ad service is currently unavailable. Check your connection and try again.',
        };
      }
    }

    if (!this.isRewardedLoaded) {
      await this.preloadRewarded();
      if (!this.isRewardedLoaded) {
        return {
          rewarded: false,
          errorMessage: 'No test ad available right now. Please try again or start a new game.',
        };
      }
    }

    return new Promise<RewardResult>(async (resolve) => {
      let rewardEarned = false;
      let settled = false;
      const tempHandles: PluginListenerHandle[] = [];

      const cleanupAndResolve = async (result: RewardResult) => {
        if (settled) return;
        settled = true;
        this.isFullScreenAdShowing = false;
        this.isRewardedLoaded = false;

        for (const h of tempHandles) {
          try {
            await h.remove();
          } catch {
            // ignore
          }
        }

        // Preload next rewarded ad for future sessions
        void this.preloadRewarded();
        resolve(result);
      };

      try {
        const rewardedHandle = await AdMob.addListener(
          RewardAdPluginEvents.Rewarded,
          (_reward: AdMobRewardItem) => {
            rewardEarned = true;
          }
        );

        const dismissedHandle = await AdMob.addListener(
          RewardAdPluginEvents.Dismissed,
          () => {
            void cleanupAndResolve({
              rewarded: rewardEarned,
              errorMessage: rewardEarned
                ? undefined
                : 'Ad was closed before completion. Watch the full ad to revive.',
            });
          }
        );

        const failedShowHandle = await AdMob.addListener(
          RewardAdPluginEvents.FailedToShow,
          () => {
            void cleanupAndResolve({
              rewarded: false,
              errorMessage: 'Could not display the test ad. Please try again.',
            });
          }
        );

        tempHandles.push(rewardedHandle, dismissedHandle, failedShowHandle);

        this.isFullScreenAdShowing = true;
        await AdMob.showRewardVideoAd();
      } catch {
        await cleanupAndResolve({
          rewarded: false,
          errorMessage: 'Unable to load rewarded test ad. Please check your connection.',
        });
      }
    });
  }

  public async cleanupListeners(): Promise<void> {
    for (const handle of this.listenerHandles) {
      try {
        await handle.remove();
      } catch {
        // Ignore cleanup errors
      }
    }
    this.listenerHandles = [];
  }
}
