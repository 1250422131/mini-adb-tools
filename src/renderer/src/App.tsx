
import { RouterProvider } from 'react-router';
import router from './utils/router';


function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App
