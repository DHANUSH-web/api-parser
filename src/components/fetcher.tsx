'use client';

import { Badge, TextField, TextArea, Tooltip, Button } from "@radix-ui/themes";
import { Search, Clipboard } from "lucide-react";
import { Roboto_Mono } from "next/font/google";
import { ChangeEvent, useState } from "react";
import axios, { isAxiosError } from "axios";
import Alert from "./alert";

const fontMono = Roboto_Mono({ subsets: ["latin"] });

export default function ApiFetcher() {
	const [apiUrl, setApiUrl] = useState<string>("");
	const [params, setParams] = useState({});
	const [jsonData, setJsonData] = useState<string>("");
	const [status, setStatus] = useState<{ status: number; message: string; }>();
	const [isError, setError] = useState<{ error: boolean; message: string; }>();

	const handleApiSearchUrl = (e: ChangeEvent<HTMLInputElement>) => {
		setApiUrl(e.target.value);
	}

	const handleDisplayJsonData = async () => {
		try {
			const args = apiUrl.split("?");
			setParams(args[1] ? args[1].split("&")?.map(param => param.split("="))?.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}) : {});
			const response = await axios.get(args[0] ?? "", { params: params });
			setStatus({ status: response.status, message: axios.HttpStatusCode[response.status] });
			const data = await response.data;
			setJsonData(JSON.stringify(data, null, 2));
			setError({ error: true, message: "Request is successful " });
		} catch (err) {
			if (isAxiosError(err)) {
				setStatus({ status: err.response?.status ?? 500, message: axios.HttpStatusCode[err.response?.status ?? 403] });
				setError({ error: true, message: err.response?.data?.message ?? err.message });
			} else
				setError({ error: true, message: `${err}` });
			setJsonData("");
		}
	}

	const handleCopyJsonData = async () => {
		try {
			const textArea = document.getElementById("jsonData") as HTMLTextAreaElement;
			textArea?.focus();
			textArea?.select();
			document.execCommand("copy");
			textArea.blur();
			setError({ error: false, message: "Copied to clipboard " });
		} catch (err) {
			setError({ error: true, message: "Failed to copy to clipboard " });
		}
	}

	return (
		<div className="flex flex-col items-center gap-5 max-w-2xl w-full">
			<Tooltip content="Test any API for free">
				<Badge size="3" className="w-fit cursor-pointer select-none">Api Fetcher</Badge>
			</Tooltip>
			<div className="flex gap-2 items-center justify-between w-full">
				<TextField.Root placeholder="Enter api url" onInput={handleApiSearchUrl} className="w-full text-xs">
					<TextField.Slot>
						<Search size={15} />
					</TextField.Slot>
				</TextField.Root>
				<Button onClick={handleDisplayJsonData} className="cursor-pointer disabled:cursor-not-allowed" disabled={!apiUrl}>Fetch</Button>
			</div>
			<div className="flex w-full">
				{status && <Badge color={status.status === 200 ? "green" : "orange"}>{status.status}: {status.message}</Badge>}
			</div>
			<div className="flex flex-col gap-2 items-end w-full">
				<TextArea id="jsonData" placeholder="Response JSON" resize="vertical" size="1" className={`w-full h-32 ${fontMono.className}`} defaultValue={jsonData} onChange={((e: ChangeEvent<HTMLTextAreaElement>) => setJsonData(e.target.value))} />
				<Tooltip content="Copy as JSON">
					<Button variant="soft" size="1" onClick={handleCopyJsonData}>
						<Clipboard size={12} />
					</Button>
				</Tooltip>
			</div>
			<div>
				{isError?.error ? <Alert type="error" message={isError.message} /> : <Alert type="success" message={isError?.message ?? "Request Succesfull"} />}
			</div>
		</div>
	)
}