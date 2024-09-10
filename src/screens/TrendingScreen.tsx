import {useFocusEffect, useNavigation} from "@react-navigation/native";
import React, {useState} from "react";
import {Platform, TVEventControl} from "react-native";
import DeviceInfo from "react-native-device-info";
import {OrientationLocker} from "react-native-orientation-locker";

import LoadingComponent from "../components/general/LoadingComponent";
import useGridColumnsPreferred from "../hooks/home/useGridColumnsPreferred";
import useHomeScreen from "../hooks/useHomeScreen";
import Logger from "../utils/Logger";

import GridFeedView from "@/components/grid/GridFeedView";
import useTrending from "@/hooks/useTrending";
import {RootNavProp} from "@/navigation/RootStackNavigator";

const LOGGER = Logger.extend("HOME");

export default function TrendingScreen() {
  const {data, fetchMore} = useTrending();
  const [fetchDate, setFetchDate] = useState(Date.now());
  const {refresh} = useHomeScreen();

  const navigation = useNavigation<RootNavProp>();

  useFocusEffect(() => {
    if (Math.abs(Date.now() - fetchDate) > 43200000) {
      LOGGER.debug("Triggering refresh home content");
      refresh();
      setFetchDate(Date.now());
    } else {
      LOGGER.debug("Last fetch has been recently. Skipping refresh");
    }
  });

  useFocusEffect(() => {
    TVEventControl.disableTVMenuKey();
  });

  const columns = useGridColumnsPreferred();

  if (!data) {
    return <LoadingComponent />;
  }

  return (
    <>
      {!Platform.isTV && !DeviceInfo.isTablet() ? (
        <OrientationLocker orientation={"PORTRAIT"} />
      ) : null}
      <GridFeedView
        items={data}
        onEndReached={() => {
          fetchMore().catch(console.warn);
        }}
      />
    </>
  );
}
