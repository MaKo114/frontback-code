import { type ReactElement } from "react";
import LoadingToRedirect from "./LoadingToRedirect";
import useTestStore from "@/store/tokStore";


interface ProtectRouteUserProps {
  element: ReactElement;
}

const ProtectRouteUser = ({ element }: ProtectRouteUserProps) => {
  const user = useTestStore((s) => s.user);
 
  if (!user) {
      return <LoadingToRedirect/>
    }

  return element
};

export default ProtectRouteUser;