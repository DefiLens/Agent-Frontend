import { useEffect, useRef, RefObject } from "react";

type RefType = RefObject<HTMLElement>;
type CallbackType = () => void;

const useClickOutside = (refs: RefType[], callback: CallbackType) => {
    const callbackRef = useRef(callback);

    // Update callback ref if the callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Check if the clicked target is outside all refs
            const isOutside = refs.every((ref) => ref.current && !ref.current.contains(event.target as Node));
            if (isOutside) {
                callbackRef.current();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [refs]);
};

export default useClickOutside;
