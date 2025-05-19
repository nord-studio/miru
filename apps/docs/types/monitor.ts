import { BaseResponsePartialMessage } from "@/types/response";
import { Monitor as MiruMonitor } from "@miru/types";

export type Monitor = MiruMonitor;

export interface RouteWithMonitor extends BaseResponsePartialMessage {
	monitor?: Monitor;
}

export interface RouteWithMultipleMonitors extends BaseResponsePartialMessage {
	monitors?: Monitor[];
}