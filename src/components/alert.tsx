'use client';

import { Badge, BadgeProps } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { TriangleAlert, CheckCircle, BadgeInfo, MessageCircle } from "lucide-react";

type AlertProps = {
    type: "normal" | "error" | "success" | "message";
    message: string;
    timeout?: number;
};

const AlertMaps = {
    message: { color: "blue", icon: <MessageCircle size={15} /> },
    error: { color: "amber", icon: <TriangleAlert size={15} /> },
    success: { color: "grass", icon: <CheckCircle size={15} /> },
    normal: { color: "gray", icon: <BadgeInfo size={15} /> },
};

export default function Alert(props: AlertProps) {
    // set the badge visible only for 5 seconds
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (props.timeout) {
            setTimeout(() => {
                setIsVisible(false);
            }, props.timeout);
        }
    }, [props.timeout]);

    return (
        <Badge id="alert" color={AlertMaps[props.type].color as BadgeProps["color"]} className={`p-2 w-full ${isVisible ? "flex" : "hidden"}`}>
            {AlertMaps[props.type].icon}
            {props.message}
        </Badge>
    )
}