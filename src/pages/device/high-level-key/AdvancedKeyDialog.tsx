import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import './AdvancedKeyDialog.less';
import socdA from '@/assets/video/socd_a.webm';
import socdB from '@/assets/video/socd_b.webm';
import socdThick from '@/assets/video/socd_thick.webm';
import socdNeutral from '@/assets/video/socd_neutral.webm';

// 定义SOCD模式类型
type SocdMode = 'a-priority' | 'b-priority' | 'thick-cover' | 'neutral';
export default defineComponent({
  props: {
    visible: { type: Boolean, required: true },
    keyType: {
      type: String,
      required: true,
      validator: (val: string) => ['dks', 'mpt', 'socd', 'mt', 'tgl', 'end', 'rs'].includes(val),
    },
    videoUrl: { type: String, required: true },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();

    // SOCD模式状态管理
    const currentSocdMode = ref<SocdMode>('thick-cover');

    // SOCD视频资源映射
    const socdVideos = {
      'a-priority': socdA,
      'b-priority': socdB,
      'thick-cover': socdThick,
      neutral: socdNeutral,
    };

    // 创建响应式的多语言配置
    const keyConfigs = computed(() => {
      return {
        dks: {
          title: t('messages.advancedKeyDialogDksTitle'),
          description: t('messages.advancedKeyDialogDksDescription'),
          features: [
            t('messages.advancedKeyDialogDksFeature1'),
            t('messages.advancedKeyDialogDksFeature2'),
            t('messages.advancedKeyDialogDksFeature3'),
            t('messages.advancedKeyDialogDksFeature4'),
          ],
          tip: t('messages.advancedKeyDialogDksTip'),
        },
        mpt: {
          title: t('messages.advancedKeyDialogMptTitle'),
          description: t('messages.advancedKeyDialogMptDescription'),
          features: [
            t('messages.advancedKeyDialogMptFeature1'),
            t('messages.advancedKeyDialogMptFeature2'),
            t('messages.advancedKeyDialogMptFeature3'),
          ],
          tip: t('messages.advancedKeyDialogMptTip'),
        },
        socd: {
          title: t('messages.advancedKeyDialogSocdTitle'),
          description: t('messages.advancedKeyDialogSocdDescription'),
          features: [
            t('messages.advancedKeyDialogSocdFeature1'),
            t('messages.advancedKeyDialogSocdFeature2'),
            t('messages.advancedKeyDialogSocdFeature3'),
            t('messages.advancedKeyDialogSocdFeature4'),
          ],
          tip: t('messages.advancedKeyDialogSocdTip'),
          modes: [
            {
              id: 'thick-cover',
              name: t('messages.advancedKeyDialogSocdModeThickCover'),
              desc: t('messages.advancedKeyDialogSocdModeThickCoverDesc'),
            },
            {
              id: 'a-priority',
              name: t('messages.advancedKeyDialogSocdModeAPriority'),
              desc: t('messages.advancedKeyDialogSocdModeAPriorityDesc'),
            },
            {
              id: 'b-priority',
              name: t('messages.advancedKeyDialogSocdModeBPriority'),
              desc: t('messages.advancedKeyDialogSocdModeBPriorityDesc'),
            },
            {
              id: 'neutral',
              name: t('messages.advancedKeyDialogSocdModeNeutral'),
              desc: t('messages.advancedKeyDialogSocdModeNeutralDesc'),
            },
          ],
        },
        mt: {
          title: t('messages.advancedKeyDialogMtTitle'),
          description: t('messages.advancedKeyDialogMtDescription'),
          features: [t('messages.advancedKeyDialogMtFeature1'), t('messages.advancedKeyDialogMtFeature2')],
          tip: t('messages.advancedKeyDialogMtTip'),
        },
        tgl: {
          title: t('messages.advancedKeyDialogTglTitle'),
          description: t('messages.advancedKeyDialogTglDescription'),
          features: [t('messages.advancedKeyDialogTglFeature1'), t('messages.advancedKeyDialogTglFeature2')],
          tip: t('messages.advancedKeyDialogTglTip'),
        },
        end: {
          title: t('messages.advancedKeyDialogEndTitle'),
          description: t('messages.advancedKeyDialogEndDescription'),
          features: [
            t('messages.advancedKeyDialogEndFeature1'),
            t('messages.advancedKeyDialogEndFeature2'),
            t('messages.advancedKeyDialogEndFeature3'),
            t('messages.advancedKeyDialogEndFeature4'),
          ],
          tip: t('messages.advancedKeyDialogEndTip'),
        },
        rs: {
          title: t('messages.advancedKeyDialogRsTitle'),
          description: t('messages.advancedKeyDialogRsDescription'),
          features: [t('messages.advancedKeyDialogRsFeature1'), t('messages.advancedKeyDialogRsFeature2')],
          tip: t('messages.advancedKeyDialogRsTip'),
        },
      };
    });

    const currentConfig = computed(() => keyConfigs.value[props.keyType]);
    // 切换SOCD模式
    const switchSocdMode = (mode: SocdMode) => {
      currentSocdMode.value = mode;
    };

    // 获取当前视频URL
    const currentVideoUrl = computed(() =>
      props.keyType === 'socd' ? socdVideos[currentSocdMode.value] : props.videoUrl,
    );
    return () =>
      props.visible && (
        <div class="dialog-overlay" onClick={() => emit('close')}>
          <div class="dialog-container" onClick={(e) => e.stopPropagation()}>
            <div class="dialog-header">
              <h2>{currentConfig.value.title}</h2>
              <button class="close-btn" onClick={() => emit('close')}>
                &times;
              </button>
            </div>

            <div class="dialog-content">
              <div class="description-section">
                <h3>{t('messages.advancedKeyDialogFunctionPrinciple')}</h3>
                <p>{currentConfig.value.description}</p>

                <h3>{t('messages.advancedKeyDialogCoreFeatures')}</h3>
                <ul class="feature-list">
                  {currentConfig.value.features.map((feature, index) => (
                    <li key={index}>
                      <span class="feature-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div class="tip-box">
                  <span class="tip-icon">💡</span>
                  <span class="tip-text">{currentConfig.value.tip}</span>
                </div>
              </div>

              <div class="video-section">
                <h3>{t('messages.advancedKeyDialogVideoTutorial')}</h3>
                {props.keyType === 'socd' && (
                  <div class="socd-mode-buttons">
                    {props.keyType === 'socd' &&
                      (props.keyType === 'socd' ? (currentConfig.value as any).modes || [] : []).map((mode) => (
                        <button
                          key={mode.id}
                          class={{
                            'mode-btn': true,
                            active: currentSocdMode.value === mode.id,
                          }}
                          onClick={() => switchSocdMode(mode.id as SocdMode)}
                          title={mode.desc}
                        >
                          {mode.name}
                        </button>
                      ))}
                  </div>
                )}
                <div class="video-wrapper">
                  <video key={currentVideoUrl.value} controls autoplay muted loop class="demo-video">
                    <source src={currentVideoUrl.value} type="video/webm" />
                  </video>
                </div>
                <p class="video-tip">
                  {t('messages.advancedKeyDialogObserveTrigger', { title: currentConfig.value.title })}
                </p>
              </div>
            </div>

            <div class="dialog-footer">
              <button class="confirm-btn" onClick={() => emit('close')}>
                {t('messages.advancedKeyDialogIUnderstand')}
              </button>
            </div>
          </div>
        </div>
      );
  },
});
