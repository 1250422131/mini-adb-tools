import {
  createHashRouter,
} from "react-router";

import HomePage from "@renderer/components/home/HomePage";
import Settings from "@renderer/Setting";
import Devices from "@renderer/tools/Devices";
import AllConnect from "@renderer/tools/AllConnect";
import DeviceInfo from "@renderer/device/Info";



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
  }, {
    path: "/device/:id",
    Component: DeviceInfo,
  }
]);

export default router