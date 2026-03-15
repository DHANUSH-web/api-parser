'use client';

import { Badge, TextField, TextArea, Tooltip, Button, Select } from "@radix-ui/themes";
import { Search, Clipboard } from "lucide-react";
import { Roboto_Mono } from "next/font/google";
import { ChangeEvent, useMemo, useState } from "react";
import axios, { isAxiosError } from "axios";
import Alert from "./alert";

const fontMono = Roboto_Mono({ subsets: ["latin"] });

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const METHODS_WITH_BODY: HttpMethod[] = ["POST", "PUT", "PATCH"];

const parseRequestUrl = (inputUrl: string) => {
	const [rawPath = "", queryString = ""] = inputUrl.split("?");
	const searchParams = new URLSearchParams(queryString);
	const params = Object.fromEntries(searchParams.entries());

	return {
		url: rawPath.trim(),
		params,
	};
};

export default function ApiFetcher() {
	const [method, setMethod] = useState<HttpMethod>("GET");
	const [apiUrl, setApiUrl] = useState<string>("");
	const [requestBody, setRequestBody] = useState<string>("");
	const [responseJson, setResponseJson] = useState<string>("");
	const [status, setStatus] = useState<{ status: number; message: string; }>();
	const [feedback, setFeedback] = useState<{ error: boolean; message: string; }>();

	const canSendBody = useMemo(() => METHODS_WITH_BODY.includes(method), [method]);

	const handleApiSearchUrl = (e: ChangeEvent<HTMLInputElement>) => {
		setApiUrl(e.target.value);
	};

	const executeRequest = async () => {
		if (!apiUrl.trim()) {
			setFeedback({ error: true, message: "Please enter a valid URL." });
			return;
		}

		try {
			const { url, params } = parseRequestUrl(apiUrl);
			if (!url) {
				setFeedback({ error: true, message: "Please enter a valid URL." });
				return;
			}

			let parsedBody: unknown;
			if (canSendBody && requestBody.trim()) {
				try {
					parsedBody = JSON.parse(requestBody);
				} catch {
					setFeedback({ error: true, message: "Request body must be valid JSON." });
					return;
				}
			}

			const response = await axios({
				method,
				url,
				params,
				data: canSendBody ? parsedBody : undefined,
				headers: canSendBody ? { "Content-Type": "application/json" } : undefined,
			});

			setStatus({ status: response.status, message: response.statusText || axios.HttpStatusCode[response.status] });
			setResponseJson(JSON.stringify(response.data, null, 2));
			setFeedback({ error: false, message: "Request was successful." });
		} catch (err) {
			if (isAxiosError(err)) {
				setStatus({
					status: err.response?.status ?? 500,
					message: err.response?.statusText || axios.HttpStatusCode[err.response?.status ?? 500],
				});

				const errorPayload = err.response?.data ?? { message: err.message };
				setResponseJson(JSON.stringify(errorPayload, null, 2));
				setFeedback({ error: true, message: err.response?.data?.message ?? err.message });
			} else {
				setResponseJson("");
				setFeedback({ error: true, message: `${err}` });
			}
		}
	};

	const handleCopyJsonData = async () => {
		try {
			navigator.clipboard.writeText(responseJson);
			setFeedback({ error: false, message: "Copied to clipboard." });
		} catch {
			setFeedback({ error: true, message: "Failed to copy to clipboard." });
		}
	};

	return (
		<div className="flex flex-col items-center gap-5 max-w-2xl w-full">
			<Tooltip content="Test any API for free">
				<Badge size="3" className="w-fit cursor-pointer select-none">Api Fetcher</Badge>
			</Tooltip>
			<div className="flex gap-2 items-center justify-between w-full">
				<Select.Root value={method} onValueChange={(value) => setMethod(value as HttpMethod)}>
					<Select.Trigger className="w-28" />
					<Select.Content>
						{HTTP_METHODS.map((httpMethod) => (
							<Select.Item key={httpMethod} value={httpMethod}>{httpMethod}</Select.Item>
						))}
					</Select.Content>
				</Select.Root>
				<TextField.Root placeholder="Enter api url" value={apiUrl} onChange={handleApiSearchUrl} className="w-full text-xs">
					<TextField.Slot>
						<Search size={15} />
					</TextField.Slot>
				</TextField.Root>
				<Button onClick={executeRequest} className="cursor-pointer disabled:cursor-not-allowed" disabled={!apiUrl.trim()}>Fetch</Button>
			</div>
			<div className="flex w-full">
				{status && <Badge color={status.status >= 200 && status.status < 300 ? "green" : "orange"}>{status.status}: {status.message}</Badge>}
			</div>
			<div className="flex flex-col gap-2 w-full">
				<TextArea
					id="requestBody"
					placeholder="Request JSON body"
					resize="vertical"
					size="1"
					className={`w-full h-28 ${fontMono.className}`}
					value={requestBody}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRequestBody(e.target.value)}
					disabled={!canSendBody}
					style={{ display: canSendBody ? "block" : "none" }}
				/>
			</div>
			<div className="flex flex-col gap-2 items-end w-full">
				<TextArea
					id="jsonData"
					placeholder="Response JSON"
					resize="vertical"
					size="1"
					className={`w-full h-32 ${fontMono.className}`}
					value={responseJson}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setResponseJson(e.target.value)}
				/>
				<Tooltip content="Copy as JSON">
					<Button variant="soft" size="1" onClick={handleCopyJsonData} disabled={!responseJson}>
						<Clipboard size={12} />
					</Button>
				</Tooltip>
			</div>
			<div>
				{feedback && <Alert type={feedback.error ? "error" : "success"} message={feedback.message} />}
			</div>
		</div>
	);
}
