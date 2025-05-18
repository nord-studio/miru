export interface BaseResponse {
	error: boolean;
	message: string;
}

export type BaseResponsePartialMessage = Omit<BaseResponse, "message"> & {
	message?: string;
};