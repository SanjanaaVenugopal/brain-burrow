import React from "react";
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
} from "@chakra-ui/react";
import { ContactForm } from "./ContactForm";
import { ContactMeClown, ContactMeEmail, ContactMeSlider } from "../../../Data/constants";

type ContactMeProps = { isOpen: boolean; onClose: () => void };

export const ContactMe: React.FC<ContactMeProps> = ({ isOpen, onClose }) => {
    const [phase, setPhase] = React.useState<
        "form" | "success" | "error" | null
    >("form");

    React.useEffect(() => {
        if (isOpen) {
            setPhase("form");
        }
    }, [isOpen]);

    // handle result from form
    const handleResult = (ok: boolean) => {
        setPhase(ok ? "success" : "error");
        // keep modal open to show status for 3s, THEN close
        setTimeout(() => {
            onClose();
            setPhase(null);
        }, 3000);
    };

    const onFormClose = () => {
        onClose();
        setPhase(null);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "xs", md: "lg", lg: "xl" }} >
            <ModalOverlay />
            <ModalContent className="dark:!bg-purple-100/70 !bg-zinc-600/30 hover:opacity-80 !m-0 !p-2 backdrop-blur-md">
                {phase === "form" && (
                    <ContactForm onResult={handleResult} onClose={onFormClose} />
                )}

                {phase === "success" && (
                    <>
                        <ModalHeader className="dark:text-purple-950 text-white/80">{ContactMeEmail.successHeader}</ModalHeader>
                        <ModalBody className="dark:text-purple-950 text-white/80">{ContactMeEmail.successTagline}</ModalBody>
                    </>
                )}

                {phase === "error" && (
                    <>
                        <ModalHeader className="dark:text-purple-950 text-white/80">{ContactMeEmail.failureHeader}</ModalHeader>
                        <ModalBody className="dark:text-purple-950 text-white/80">{ContactMeEmail.failureTagline}</ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
