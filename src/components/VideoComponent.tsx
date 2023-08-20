import React, {useMemo, useState} from "react";
import Video from "react-native-video";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Logger from "../utils/Logger";
import {useIsFocused} from "@react-navigation/native";
import {YTChapter, YTVideoInfo} from "../extraction/Types";

const LOGGER = Logger.extend("VIDEO");

interface Props {
  url: string;
  hlsUrl?: string;
  style?: StyleProp<ViewStyle>;
  videoInfo?: YTVideoInfo;
  chapters?: YTChapter[];
  fullscreen?: boolean;
  onEndReached?: () => void;
  onPlaybackInfoUpdate?: (playbackInfos: {
    width: number;
    height: number;
  }) => void;
}

export default function VideoComponent({
  url,
  hlsUrl,
  videoInfo,
  fullscreen,
  style,
  ...callbacks
}: Props) {
  // const player = useRef<Video>();
  const isFocused = useIsFocused();
  const [failbackURL, setFailbackUrl] = useState(false);

  const parsedChapters = useMemo(() => {
    return videoInfo?.chapters?.map(mapChapters) ?? [];
  }, [videoInfo?.chapters]);

  // As changing url causes duplicate errors
  if (failbackURL) {
    return <VideoComponent url={url} style={style} {...callbacks} />;
  }

  return (
    <>
      <ActivityIndicator style={styles.activityIndicator} size={"large"} />
      <Video
        source={{
          // uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          // uri: "https://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8",
          // type: "m3u8",
          // uri: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
          // type: "mpd",
          // uri: `http://localhost:7500/video/${videoId}/master.m3u8`,
          uri: hlsUrl ?? url,
          // @ts-ignore Own version
          title: videoInfo?.title,
          subtitle: videoInfo?.author?.name,
          description: videoInfo?.description,
        }}
        style={
          (style as any) ?? [styles.fullScreen, StyleSheet.absoluteFillObject]
        }
        controls
        paused={!isFocused}
        fullscreen={fullscreen ?? true}
        resizeMode={"contain"}
        // @ts-ignore Own version
        chapters={parsedChapters}
        // Event listener
        onLoad={(data: any) => {
          LOGGER.debug("Video Loading...", JSON.stringify(data, null, 4));
          callbacks.onPlaybackInfoUpdate?.({
            width: data?.naturalSize?.width,
            height: data?.naturalSize?.height,
          });
        }}
        onLoadStart={() => LOGGER.debug("Video Start Loading...")}
        onError={(error: any) => {
          LOGGER.warn(error);
          if (hlsUrl) {
            setFailbackUrl(true);
            LOGGER.warn("Switching to fallback url");
          }
        }}
        onEnd={() => {
          LOGGER.debug("End reached");
          callbacks.onEndReached?.();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  activityIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

function mapChapters(chapter: YTChapter) {
  return {
    title: chapter.title,
    startTime: chapter.startDuration,
    endTime: chapter.endDuration,
  };
}
