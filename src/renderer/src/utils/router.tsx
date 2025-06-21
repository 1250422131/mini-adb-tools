import {
  createHashRouter,
  redirect,
} from "react-router";

import HomePage from "@renderer/components/home/HomePage";
import Settings from "@renderer/Setting";
import Devices from "@renderer/tools/Devices";
import { useAdbStore } from "@renderer/store/adbStore";
import AllConnect from "@renderer/tools/AllConnect";


const checkAdbLoader = async () => {
  // try {
  //   const result = await useAdbStore.getState().updateCheckAdbState();
  //   if (result.success && result.count > 0) {
  //     return null;
  //   } else {
  //     throw redirect('/');
  //   }
  // } catch (error) {
  //   throw redirect('/');
  // }
}

const router = createHashRouter([
  {
    path: "/",
    Component: HomePage,
    children: [
      {
        path: "tools/all-connect",
        Component: AllConnect,
      },
      {
        index: true,
        Component: Settings,
      },
      {
        path: "tools/devices",
        Component: Devices,
      },
    ]
  }
]);

export default router