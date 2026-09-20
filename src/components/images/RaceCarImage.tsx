import AuthenticatedFocalImage from "./AuthenticatedFocalImage";
import FocalImage from "./FocalImage";

type RaceCarImageProps = {
  src: string;
  alt: string;
  focusX: number;
  focusY: number;
  cropPercent: number;
  className?: string;
};

function RaceCarImage(props: RaceCarImageProps) {
  if (props.src.includes("/driver-photos/")) {
    return <AuthenticatedFocalImage {...props} />;
  }

  return <FocalImage {...props} />;
}

export default RaceCarImage;
