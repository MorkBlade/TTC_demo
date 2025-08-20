<template>
  <div class="tab-content">
    <!-- 图片设置内容 -->
    <div class="image-settings">
      <h3>{{ t('messages.screenBootImageSetting') }}</h3>
      <div v-if="displayerInfo.gifNum > 1" class="gifNum">
        <t-radio-group v-model="bootIndex" :disabled="isUpdating">
          <t-radio :value="0">{{ t('messages.screenFirstImage') }}</t-radio>
          <t-radio :value="1">{{ t('messages.screenSecondImage') }}</t-radio>
        </t-radio-group>
        <t-button :disabled="isUpdating" @click="setDisplayerBoot">{{ t('messages.screenSetAsBootImage') }}</t-button>
      </div>
      <h3>{{ t('messages.screenImageSetting') }}</h3>
      <div v-if="displayerInfo.gifNum > 1" class="gifNum">
        <t-radio-group v-model="gifIndex" :disabled="isUpdating">
          <t-radio :value="0">{{ t('messages.screenFirstImage') }}</t-radio>
          <t-radio :value="1">{{ t('messages.screenSecondImage') }}</t-radio>
        </t-radio-group>
      </div>
      <p class="upload-tips">{{ t('messages.screenUploadTips') }}</p>

      <!-- GIF上传区域 -->
      <div class="gif-upload-section">
        <h4>{{ t('messages.screenUploadGifImage') }}</h4>
        <t-upload
          class="gif-uploader"
          action="#"
          :auto-upload="false"
          :on-change="handleGifChange"
          :show-file-list="false"
          :show-image-file-name="false"
          :accept="['image/gif']"
        >
          <t-button :disabled="isUpdating">{{ t('messages.screenSelectGifFile') }}</t-button>
          <div v-if="gifFile" class="selected-file">
            {{ t('messages.screenSelectedFile', { fileName: gifFile.name }) }}
          </div>
        </t-upload>

        <div v-if="isLoading" class="loading-indicator">
          <t-progress :percentage="loadingProgress" :stroke-width="6" type="circle"></t-progress>
          <div class="loading-text">{{ t('messages.screenParsingGifFrames') }}</div>
        </div>
      </div>

      <!-- 主编辑区域 - 分为左右两栏 -->
      <div v-if="frames.length > 0" class="main-edit-layout">
        <!-- 左侧：预览和时间轴 -->
        <div class="left-column">
          <!-- 单帧图片预览 -->
          <div v-show="hasCutFrames" class="frame-preview-container">
            <h4>
              {{ t('messages.screenCutFramePreview', { current: selectedCutFrameIndex + 1, total: cutFrames.length }) }}
            </h4>
            <div class="preview-container">
              <div class="cropper-container">
                <img
                  :src="cutFrames[selectedCutFrameIndex]"
                  :style="{
                    width: gifWidth + 'px',
                    height: gifHeight + 'px',
                  }"
                  class="selected-frame-preview"
                />
              </div>
            </div>
          </div>
          <div v-show="selectedFrameIndex !== null && !hasCutFrames" class="frame-preview-container">
            <h4>{{ t('messages.screenFramePreview', { current: selectedFrameIndex + 1, total: frames.length }) }}</h4>
            <div class="preview-container">
              <div class="cropper-container">
                <img ref="cropperImg" :src="frames[selectedFrameIndex]" class="selected-frame-preview" />
              </div>
            </div>
          </div>
          <div class="cutBox">
            <t-button :disabled="isUpdating" class="cutBotton" @click="cropAll">{{
              t('messages.screenOneClickCrop')
            }}</t-button>
            <t-button :disabled="selectedFrameIndex === null || isUpdating" class="cutBotton" @click="crop">{{
              t('messages.screenCrop')
            }}</t-button>
          </div>
          <!-- GIF帧时间轴 -->
          <div class="frames-timeline">
            <h4>{{ t('messages.screenGifFrameTimeline', { total: frames.length }) }}</h4>
            <div class="timeline-container">
              <div class="frames-scroll-container">
                <div
                  v-for="(frame, index) in frames"
                  :key="index"
                  class="timeline-frame-item"
                  :class="{ selected: selectedFrameIndex === index, disabled: isUpdating }"
                  @click="isUpdating ? null : selectFrame(index)"
                >
                  <img :src="frame" :alt="`帧 ${index + 1}`" class="timeline-frame-image" />
                  <div class="frame-number">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 剪切后的GIF帧时间轴 -->
          <div v-if="showCutFrames" class="frames-timeline">
            <h4>{{ t('messages.screenCroppedGifFrameTimeline', { total: cutFrames.length }) }}</h4>
            <div class="timeline-container">
              <div class="frames-scroll-container">
                <div
                  v-for="(frame, index) in cutFrames"
                  :key="index"
                  class="timeline-frame-item"
                  :class="{ selected: selectedCutFrameIndex === index, disabled: isUpdating }"
                  @click="isUpdating ? null : selectCutFrame(index)"
                >
                  <img :src="frame" :alt="`帧 ${index + 1}`" class="timeline-frame-image" />
                  <div class="frame-number">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：图片更新框 -->
        <div class="right-column">
          <div class="update-container">
            <h4>{{ t('messages.screenImageUpdate') }}</h4>
            <div class="update-content">
              <div v-if="selectedFrameIndex !== null" class="frames-to-update">
                <p class="info-text">{{ t('messages.screenUpdateFollowingFrames') }}</p>
                <div class="update-frames-grid">
                  <div v-for="frameId in selectedFrameIds" :key="frameId" class="frame-id-item">
                    {{ frameId + 1 }}
                  </div>
                </div>
              </div>
              <p class="info-text" style="color: #0e59e0">
                {{ t('messages.screenMaxFramesSupported', { maxFrames }) }}
              </p>
              <!-- 图片更新进度条 -->
              <div v-if="isUpdating" class="update-progress-container">
                <div v-if="isClearOld">{{ t('messages.screenWaitingKeyboardErase') }}</div>
                <div class="progress-header">
                  <span class="progress-info">{{
                    t('messages.screenUpdateProgress', { current: currentframeID, total: selectedFrameIds.length })
                  }}</span>
                  <span class="progress-percent">{{
                    t('messages.screenUpdateProgressPercent', { percent: UpgradeProgress })
                  }}</span>
                </div>
                <t-progress
                  :percentage="UpgradeProgress"
                  :stroke-width="8"
                  :show-text="false"
                  class="custom-progress"
                ></t-progress>
                <span style="color: red">{{ t('messages.screenUpdateImageWarning') }}</span>
              </div>

              <t-button
                size="large"
                class="update-button"
                :disabled="selectedFrameIndex === null || isUpdating"
                @click="updateImage"
              >
                {{ isUpdating ? t('messages.screenUpdating') : t('messages.screenUpdateImageToKeyboard') }}
              </t-button>
              <p class="help-text">
                {{
                  t('messages.screenHelpText', {
                    currentFrame: showCutFrames ? selectedCutFrameIndex + 1 : selectedFrameIndex + 1,
                    frameCount:
                      selectedFrameIds.length > 0
                        ? t('messages.screenTotalFrames', { count: selectedFrameIds.length })
                        : '',
                  })
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import omggif from 'omggif';
import { computed, onMounted, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css'; // 必须引入[1,2,4](@ref)
import { useDisplayerStore, useConfigStore } from '@/store';
import { t } from '@/locales';

const displayerStore = useDisplayerStore();
const configStore = useConfigStore();
const { displayerInfo } = storeToRefs(displayerStore);
const gifWidth = ref(0);
const gifHeight = ref(0);
const currentframeID = ref(0);
const UpgradeProgress = ref(0);
const gifIndex = ref(0);
const bootIndex = ref(0);
const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
// GIF处理相关
const gifFile = ref(null);
const gifStatus = ref('');
const frames = ref([]);
const showCutFrames = ref(false);
const cutFrames = ref([]);
const selectedCutFrameIndex = ref(null);
const hasCutFrames = ref(false);
const selectedFrameIndex = ref(null);
const maxFrames = ref(20);
const isLoading = ref(false);
const loadingProgress = ref(0);
const cuttingWidth = ref(320);
const cuttingHeight = ref(172);
const isClearOld = computed(() => {
  return gifStatus.value === 'clearOld';
});
const { displayerType, gifNum } = displayerInfo.value;
if (displayerType === 1) {
  cuttingWidth.value = 240;
  cuttingHeight.value = 135;
}
const frameConfig = {
  '0_1': 75,
  '0_2': 37,
  '1_1': 128,
  '1_2': 64,
};

const key = `${displayerType}_${gifNum}`;
maxFrames.value = frameConfig[key] || 20; // 默认值20

// 计算要更新的帧ID列表（当前帧往后20帧）
const selectedFrameIds = computed(() => {
  if (selectedFrameIndex.value === null || frames.value.length === 0) {
    return [];
  }

  const startIndex = showCutFrames.value ? selectedCutFrameIndex.value : selectedFrameIndex.value;
  const frameIds = [];

  for (let i = 0; i < maxFrames.value; i++) {
    // 如果已经超出帧总数，则跳出循环
    if (startIndex + i >= frames.value.length) {
      break;
    }
    frameIds.push(startIndex + i);
  }

  return frameIds;
});

/**
 * 将图片转换为RGB565格式的位图数据（小端存储）
 * @param {string} imageUrl - 图片的Data URL
 * @param {Object} options - 配置选项
 * @param {number} options.width - 输出图片宽度
 * @param {number} options.height - 输出图片高度
 * @returns {Promise<Uint8Array>} - 返回RGB565位图数据（大端存储）
 */
const convertImageToBitmap = (imageUrl, options = { width: cuttingWidth.value, height: cuttingHeight.value }) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        // 创建Canvas并绘制图像
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = options.width;
        canvas.height = options.height;
        ctx.drawImage(img, 0, 0, options.width, options.height);

        // 获取像素数据
        const imageData = ctx.getImageData(0, 0, options.width, options.height);
        const pixels = imageData.data;

        // 计算RGB565数据长度 (宽*高*2字节)
        const dataLength = options.width * options.height * 2;
        // 创建缓冲区
        const rgb565Data = new Uint8Array(dataLength);

        // 转换RGB565数据（大端存储）
        for (let x = 0; x < options.width; x++) {
          for (let y = 0; y < options.height; y++) {
            const srcIndex = (y * options.width + x) * 4;
            const destIndex = (x * options.height + y) * 2;

            // 提取RGB通道
            const r = pixels[srcIndex];
            const g = pixels[srcIndex + 1];
            const b = pixels[srcIndex + 2];

            // 转换为RGB565格式
            const r5 = (r >> 3) & 0x1f;
            const g6 = (g >> 2) & 0x3f;
            const b5 = (b >> 3) & 0x1f;
            const value = (r5 << 11) | (g6 << 5) | b5;

            // === 关键修改：改为大端存储 ===
            // 高位字节在前（MSB），低位字节在后（LSB）
            rgb565Data[destIndex] = (value >> 8) & 0xff; // 高8位（MSB）
            rgb565Data[destIndex + 1] = value & 0xff; // 低8位（LSB）
          }
        }

        resolve(rgb565Data);
      } catch (error) {
        reject(new Error(`数据处理失败: ${error.message}`));
      }
    };

    img.onerror = (error) => {
      reject(new Error(`图片加载失败: ${error}`));
    };

    img.src = imageUrl;
  });
};

// 处理GIF文件变更
const handleGifChange = async (file) => {
  [file] = file;
  if (!file || !file.raw) return;

  const fileType = file.raw.type;
  console.log('fileType', fileType);
  if (fileType !== 'image/gif') {
    // ElMessage.error('请选择GIF格式的文件');
    return;
  }

  gifFile.value = file;
  await parseGifFrames(file.raw);
  cutFrames.value = JSON.parse(JSON.stringify(frames.value));
  console.log('frames', frames);
  initCropper();
  selectedFrameIndex.value = 0;
  selectedCutFrameIndex.value = 0;
  showCutFrames.value = false;
};

// 解析GIF帧
const parseGifFrames = async (gifBlob) => {
  // 声明在函数顶部，这样在catch块中也能访问
  let progressInterval;
  console.log('parseGifFrames', parseGifFrames);
  try {
    isLoading.value = true;
    loadingProgress.value = 0;
    frames.value = [];
    selectedFrameIndex.value = null;

    // 开始加载进度显示
    let progress = 0;
    progressInterval = setInterval(() => {
      progress += 5;
      if (progress > 90) progress = 90; // 保留最后10%用于实际渲染
      loadingProgress.value = progress;
    }, 100);

    // 将GIF文件转换为ArrayBuffer
    const arrayBuffer = await gifBlob.arrayBuffer();

    // 使用omggif解析GIF
    const gifReader = new omggif.GifReader(new Uint8Array(arrayBuffer));
    console.log('gifReader', gifReader);
    if (
      !(gifReader.width >= cuttingWidth.value && gifReader.height >= cuttingHeight.value) ||
      (gifReader.width > 600 && gifReader.height > 600)
    ) {
      MessagePlugin.error(
        t('messages.screenGifResolutionError', {
          width: cuttingWidth.value,
          height: cuttingHeight.value,
          currentWidth: gifReader.width,
          currentHeight: gifReader.height,
        }),
      );
      isLoading.value = false;
      loadingProgress.value = 0;
      frames.value = [];
      selectedFrameIndex.value = null;
      return;
    }
    gifWidth.value = gifReader.width;
    gifHeight.value = gifReader.height;
    const numFrames = gifReader.numFrames();

    // 停止进度条动画
    clearInterval(progressInterval);
    loadingProgress.value = 95;

    // 如果没有帧，显示错误
    if (!numFrames || numFrames === 0) {
      throw new Error(t('messages.screenNoValidGifFrames'));
    }

    // 准备Canvas用于渲染
    const canvas = document.createElement('canvas');
    const { width } = gifReader;
    const { height } = gifReader;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 渲染所有帧
    const frameUrls = [];

    // 创建用于存储完整帧的缓冲区
    const fullFrameBuffer = new Uint8Array(width * height * 4);

    // 转换每一帧，正确处理帧叠加
    for (let i = 0; i < numFrames; i++) {
      // 获取帧信息（暂时未使用但可能在后续扩展时需要）
      // const _frameInfo = gifReader.frameInfo(i);

      // 创建当前帧的缓冲区
      const pixelBuf = new Uint8Array(width * height * 4);

      // 将帧渲染到缓冲区
      gifReader.decodeAndBlitFrameRGBA(i, pixelBuf);

      // 处理帧叠加 - 根据处置方法决定如何组合帧
      for (let j = 0; j < width * height * 4; j += 4) {
        // 如果像素完全透明(Alpha=0)，使用前一帧的像素
        if (pixelBuf[j + 3] === 0) {
          pixelBuf[j] = fullFrameBuffer[j]; // R
          pixelBuf[j + 1] = fullFrameBuffer[j + 1]; // G
          pixelBuf[j + 2] = fullFrameBuffer[j + 2]; // B
          pixelBuf[j + 3] = fullFrameBuffer[j + 3]; // A
        }
      }

      // 保存当前帧作为下一帧的背景
      fullFrameBuffer.set(pixelBuf);

      // 创建ImageData并绘制到canvas
      const imageData = new ImageData(new Uint8ClampedArray(pixelBuf), width, height);
      ctx.putImageData(imageData, 0, 0);

      // 转换为URL并存储
      const frameUrl = canvas.toDataURL('image/png');
      frameUrls.push(frameUrl);

      // 更新最终加载进度（从95%到100%）
      loadingProgress.value = 95 + (i / numFrames) * 5;
    }

    // 更新UI
    frames.value = frameUrls;
    console.log('frames.value', frames.value);
    if (frames.value.length > 0) {
      selectedFrameIndex.value = 0;
    }

    isLoading.value = false;
    loadingProgress.value = 100;
  } catch (error) {
    console.error(t('messages.screenParseGifFailed'), error);
    isLoading.value = false;
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    // 清空已选文件
    gifFile.value = null;
  }
};

// 选择帧
const selectFrame = (index) => {
  hasCutFrames.value = false;
  selectedFrameIndex.value = index;
};

// 选择剪切帧
const selectCutFrame = (index) => {
  hasCutFrames.value = true;
  selectedCutFrameIndex.value = index;
};

// 存储所有帧的位图数据
const bitmapFrames = [];

// 图片更新状态标志
const isUpdating = ref(false);

// 更新图片到键盘屏幕，按钮点击事件
const updateImage = async () => {
  if (selectedFrameIds.value.length === 0) return;
  checkImageDimensions(
    showCutFrames.value
      ? cutFrames.value.slice(selectedCutFrameIndex.value)
      : frames.value.slice(selectedFrameIndex.value),
  ).then(async (results) => {
    // 筛选不符合尺寸的图片
    const invalidImages = results.filter((img) => !img.isMatch && !img.error);

    if (invalidImages.length === 0) {
      try {
        // 设置更新状态为true，禁用时间轴点击
        isUpdating.value = true;

        // 清空 bitmapFrames
        bitmapFrames.length = 0;

        // 准备所有转换任务
        console.log('selectedFrameIds.value', frames.value, selectedFrameIds.value);
        const conversionTasks = selectedFrameIds.value.map((frameIndex) => {
          return {
            frameIndex,
            frameUrl: showCutFrames.value ? cutFrames.value[frameIndex] : frames.value[frameIndex],
          };
        });
        console.log('conversionTasks', conversionTasks);
        // 并行处理所有帧的转换任务
        const results = await Promise.all(
          conversionTasks.map(async (task) => {
            const bitmapData = await convertImageToBitmap(task.frameUrl, {
              width: cuttingWidth.value,
              height: cuttingHeight.value,
            });
            console.log('bitmapData', bitmapData);
            return bitmapData;
          }),
        );

        // 收集处理结果
        bitmapFrames.push(...results);

        // 输出处理结果
        console.log(`共处理了 ${bitmapFrames.length} 个帧的图片数据`);
        console.log('位图数据集合:', bitmapFrames);

        // 计算处理时间
        console.log('setDisplayerGIf', gifIndex.value, selectedFrameIds.value.length);
        console.log('cuttingWidth.value * cuttingHeight.value', cuttingWidth.value, cuttingHeight.value);
        await displayerStore.updateDisplayerGIF(
          gifIndex.value,
          selectedFrameIds.value.length,
          cuttingWidth.value * cuttingHeight.value * 2,
          bitmapFrames,
          ({ current, total, percentage, updateStatus, index }) => {
            currentframeID.value = index + 1;
            UpgradeProgress.value = percentage;
            gifStatus.value = updateStatus;
            let loadingId = null;
            if (updateStatus === 'error') {
              setTimeout(() => {
                MessagePlugin.error(t('messages.screenUpdateFailed'));
              }, 2000);
            }
            if (updateStatus === 'clearOld') {
              loadingId = MessagePlugin.loading(t('messages.screenWaitingKeyboardErase'));
            } else if (loadingId) {
              MessagePlugin.close(loadingId);
            }
            console.log('updateStatus.value', current, total, updateStatus, percentage, index);
          },
        );
        await delay(1000);
        isUpdating.value = false;
        currentframeID.value = 0;
        UpgradeProgress.value = 0;
      } catch (error) {
        console.error('更新图片到键盘失败:', error);
        // 发生错误时重置更新状态
        isUpdating.value = false;
      }
    } else {
      console.log('不符合规则');
      MessagePlugin.error(t('messages.screenGifResolutionTooLarge'));
    }
  });
};
watch(isUpdating, (val) => {
  if (val) {
    configStore.setActiveMenuAndDisableOthers('screen');
  } else {
    configStore.setAllEnabledMenu();
  }
});
const fileQueue = ref([]);
const cropperImg = ref();
const cropper = ref(null);

// 1. 创建检查函数
const checkImageDimensions = (base64Array, targetWidth = cuttingWidth.value, targetHeight = cuttingHeight.value) => {
  // 结果数组：记录每张图片状态
  const results = [];
  console.log('base64Array', base64Array);
  // 2. 遍历所有 Base64 图片
  const promises = base64Array.map(
    (base64, index) =>
      new Promise((resolve) => {
        const img = new Image();

        // 3. 加载图片并获取尺寸
        img.onload = () => {
          const { width } = img;
          const { height } = img;
          console.log('width2222', width, height);
          const isMatch = width === targetWidth && height === targetHeight;

          // 4. 记录结果
          results[index] = {
            index,
            width,
            height,
            isMatch,
            base64Preview: `${base64.substring(0, 50)}...`, // 缩略显示
          };
          resolve();
        };

        // 处理加载失败
        img.onerror = () => {
          results[index] = {
            index,
            error: true,
            message: '图片加载失败',
          };
          resolve();
        };

        img.src = base64;
      }),
  );

  // 5. 返回检查结果
  return Promise.all(promises).then(() => results);
};
const crop = () => {
  const dataUrl = cropper.value
    .getCroppedCanvas({
      width: cuttingWidth.value,
      height: cuttingHeight.value,
    })
    .toDataURL();
  const img = new Image();
  console.log('width1111', cuttingWidth.value, cuttingHeight.value);
  img.src = dataUrl;
  img.onload = function () {
    console.log('图片宽度:', img.width);
    console.log('图片高度:', img.height);
  };
  console.log('dataUrl', dataUrl, frames.value, selectedFrameIndex.value);
  cutFrames.value[selectedFrameIndex.value] = dataUrl;
  showCutFrames.value = true;
  MessagePlugin.success(t('messages.screenCropSuccess'));
};

const cropAll = async () => {
  fileQueue.value = cutFrames.value.map((item, index) => ({
    url: item,
    file: {
      name: `frame_${index}.png`,
    },
  }));
  // 1. 创建并行处理队列
  const cropTasks = fileQueue.value.map(
    (item) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = item.url;

        img.onload = () => {
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          document.body.appendChild(tempDiv);

          const imgElem = document.createElement('img');
          imgElem.src = item.url;
          tempDiv.appendChild(imgElem);

          // 2. 初始化虚拟Cropper实例
          const cropper = new Cropper(imgElem, {
            ready() {
              this.cropper.setCropBoxData({
                width: cuttingWidth.value,
                height: cuttingHeight.value,
                left: gifWidth.value / 2 - cuttingWidth.value / 2, // 水平居中
                top: gifHeight.value / 2 - cuttingHeight.value / 2, // 垂直居中
              });

              // 3. 获取裁剪结果
              const canvas = this.cropper.getCroppedCanvas({
                width: cuttingWidth.value,
                height: cuttingHeight.value,
              });
              const resultURL = canvas.toDataURL('image/jpeg'); // Base64 URL
              resolve(resultURL);
            },
          });
          cropper.disable();
          // cropper.destroy();
        };
      }),
  );

  // 5. 获取全部结果
  const results = await Promise.all(cropTasks);
  cutFrames.value = results;
  showCutFrames.value = true;
  MessagePlugin.success(t('messages.screenCropSuccess'));
  console.log('10张裁剪结果:', results);

  // 后续操作：上传或下载
  // uploadToServer(results);
};
// 初始化或替换图片
const updateCropperImage = (src) => {
  if (!cropper.value) {
    initCropper(src);
  } else {
    cropper.value.replace(src);
  }
};
const setDisplayerBoot = async () => {
  console.log('bootIndex.value', bootIndex.value);
  await displayerStore.setDisplayerBoot(bootIndex.value);
  MessagePlugin.success(t('messages.screenSetBootImageSuccess'));
};
// 监听帧索引变化
watch(
  () => selectedFrameIndex.value,
  (newIndex) => {
    const src = frames.value[newIndex];
    if (src) {
      const img = new Image();
      img.src = src;
      img.onload = () => updateCropperImage(src);
    }
  },
  { immediate: true },
);
function initCropper() {
  nextTick(() => {
    // 等待DOM渲染完成[2,9](@ref)
    console.log('cropperImg', cropperImg.value, gifWidth.value, gifHeight.value);
    cropper.value = new Cropper(cropperImg.value, {
      aspectRatio: NaN, // 禁用比例约束
      viewMode: 1, // 必须用0/1/2，禁用比例约束需要0
      cropBoxResizable: false, // 禁止调整大小
      cropBoxMovable: true, // 允许移动位置
      minContainerWidth: gifWidth.value,
      minContainerHeight: gifHeight.value,
      // 禁止缩放相关配置
      zoomable: false, // 禁止缩放图片（改变焦距）[4,8](@ref)
      zoomOnTouch: false, // 禁止触屏缩放
      zoomOnWheel: false, // 禁止鼠标滚轮缩放
      scalable: false, // 禁止改变图片长宽（非等比缩放）[4](@ref)
      dragMode: 'move',
      toggleDragModeOnDblclick: false,
      ready() {
        // 强制设置裁切框尺寸
        this.cropper.setCropBoxData({
          width: cuttingWidth.value,
          height: cuttingHeight.value,
          left: gifWidth.value / 2 - cuttingWidth.value / 2, // 水平居中
          top: gifHeight.value / 2 - cuttingHeight.value / 2, // 垂直居中
        });
      },
    });

    console.log('cropperImg', cropperImg.value, Cropper);
  });
}
onMounted(() => {
  // 组件挂载后的初始化逻辑
});
</script>

<style scoped lang="less">
@import './index.less';
.cutBox {
  display: flex;
  justify-content: flex-end;
}
.cutBotton {
  margin-right: 50px;
}
</style>
