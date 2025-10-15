import { CloseButton } from "@chakra-ui/react";

type CloseButtonIconProps = {
    onClick: () => void;
    wantDark?: boolean;
};

export const CloseButtonIcon: React.FC<CloseButtonIconProps> = ({
    onClick,
    wantDark = true,
}) => {
    return (
        <CloseButton
            onClick={onClick}
            position="absolute"
            right="12px"
            top="12px"
            className={
                wantDark
                    ? "!bg-transparent dark:!text-purple-950 !text-white/80 transition-all duration-200 hover:backdrop-blur-md"
                    : "!bg-transparent !text-white/80 transition-all duration-200 hover:backdrop-blur-md"
            }
        />
    );
};
