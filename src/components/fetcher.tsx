'use client';

import { Badge, TextField, Tooltip, Button, Select, Tabs, Flex, Box, Text, Card } from "@radix-ui/themes";
import { Search, Clipboard, Play } from "lucide-react";
import { Roboto_Mono } from "next/font/google";
import { ChangeEvent, useState } from "react";
import axios, { isAxiosError, Method } from "axios";
import Alert from "./alert";
import Editor from "@monaco-editor/react";

const fontMono = Roboto_Mono({ subsets: ["latin"] });

export default function ApiFetcher() {
	const [apiUrl, setApiUrl] = useState<string>("");
	const [method, setMethod] = useState<string>("GET");
	const [headers, setHeaders] = useState<string>("{\n  \n}");
	const [body, setBody] = useState<string>("{\n  \n}");
	const [params, setParams] = useState({});
	const [jsonData, setJsonData] = useState<string>("");
	const [status, setStatus] = useState<{ status: number; message: string; }>();
	const [isError, setError] = useState<{ error: boolean; message: string; }>();
	const [loading, setLoading] = useState(false);

	const handleApiSearchUrl = (e: ChangeEvent<HTMLInputElement>) => {
		setApiUrl(e.target.value);
	}

	const handleDisplayJsonData = async () => {
		setLoading(true);
		setJsonData("");
		setStatus(undefined);
		setError(undefined);

		try {
			const args = apiUrl.split("?");
			const parsedParams = args[1] ? args[1].split("&")?.map(param => param.split("="))?.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}) : {};
			setParams(parsedParams);

			let parsedHeaders = {};
			if (headers && headers.trim() !== "") {
				try {
					parsedHeaders = JSON.parse(headers);
				} catch (e) {
					setError({ error: true, message: "Invalid JSON in Headers" });
					setLoading(false);
					return;
				}
			}

			let parsedBody = undefined;
			if (["POST", "PUT", "PATCH"].includes(method) && body && body.trim() !== "") {
				try {
					parsedBody = JSON.parse(body);
				} catch (e) {
					setError({ error: true, message: "Invalid JSON in Body" });
					setLoading(false);
					return;
				}
			}

			const response = await axios({
				method: method as Method,
				url: args[0] ?? "",
				params: parsedParams,
				headers: parsedHeaders,
				data: parsedBody,
			});

			setStatus({ status: response.status, message: axios.HttpStatusCode[response.status] });
			const data = response.data;
			setJsonData(JSON.stringify(data, null, 2));
			setError({ error: false, message: "Request successful" });
		} catch (err) {
			if (isAxiosError(err)) {
				setStatus({ status: err.response?.status ?? 500, message: axios.HttpStatusCode[err.response?.status ?? 403] });
				setError({ error: true, message: err.response?.data?.message || err.message });
				if (err.response?.data) {
					setJsonData(JSON.stringify(err.response.data, null, 2));
				}
			} else {
				setError({ error: true, message: `${err}` });
			}
		} finally {
			setLoading(false);
		}
	}

	const handleCopyJsonData = async () => {
		try {
			navigator.clipboard.writeText(jsonData);
			setError({ error: false, message: "Copied to clipboard" });
		} catch (err) {
			setError({ error: true, message: "Failed to copy to clipboard" });
		}
	}

	return (
		<Flex direction="column" align="center" gap="5" className="max-w-3xl w-full">
			<Tooltip content="Test any API for free">
				<Badge size="3" className="w-fit cursor-pointer select-none">API Fetcher</Badge>
			</Tooltip>

			<Card size="3" className="w-full">
				<Flex direction="column" gap="4">
					<Flex gap="2" align="center" justify="between" className="w-full">
						<Select.Root value={method} onValueChange={setMethod}>
							<Select.Trigger className="w-24" />
							<Select.Content>
								<Select.Item value="GET">GET</Select.Item>
								<Select.Item value="POST">POST</Select.Item>
								<Select.Item value="PUT">PUT</Select.Item>
								<Select.Item value="PATCH">PATCH</Select.Item>
								<Select.Item value="DELETE">DELETE</Select.Item>
							</Select.Content>
						</Select.Root>

						<TextField.Root placeholder="Enter API URL (e.g., https://api.example.com/data)" value={apiUrl} onInput={handleApiSearchUrl} className="w-full flex-1">
							<TextField.Slot>
								<Search size={15} />
							</TextField.Slot>
						</TextField.Root>

						<Button onClick={handleDisplayJsonData} className="cursor-pointer" disabled={!apiUrl || loading}>
							{loading ? "Fetching..." : <><Play size={15} /> Send</>}
						</Button>
					</Flex>

					<Tabs.Root defaultValue="headers">
						<Tabs.List>
							<Tabs.Trigger value="headers">Headers</Tabs.Trigger>
							<Tabs.Trigger value="body" disabled={!["POST", "PUT", "PATCH"].includes(method)}>Body</Tabs.Trigger>
						</Tabs.List>

						<Box pt="3">
							<Tabs.Content value="headers">
								<Editor
									height="8rem"
									language="json"
									theme="vs-dark"
									value={headers}
									onChange={(value) => setHeaders(value || "")}
									options={{ minimap: { enabled: false }, formatOnPaste: true }}
								/>
							</Tabs.Content>

							<Tabs.Content value="body">
								<Editor
									height="8rem"
									language="json"
									theme="vs-dark"
									value={body}
									onChange={(value) => setBody(value || "")}
									options={{ minimap: { enabled: false }, formatOnPaste: true }}
								/>
							</Tabs.Content>
						</Box>
					</Tabs.Root>
				</Flex>
			</Card>

			<Card size="3" className="w-full">
				<Flex direction="column" gap="3">
					<Flex justify="between" align="center">
						<Text weight="bold">Response</Text>
						{status && (
							<Badge color={status.status >= 200 && status.status < 300 ? "green" : "red"}>
								{status.status} {status.message && `- ${status.message}`}
							</Badge>
						)}
					</Flex>

					<Box position="relative" className="min-h-[200px] border border-gray-700 rounded-md overflow-hidden">
						<Editor
							height="200px"
							language="json"
							theme="vs-dark"
							value={jsonData}
							options={{
								readOnly: true,
								minimap: { enabled: false },
								wordWrap: "on",
								scrollBeyondLastLine: false,
							}}
						/>
						{jsonData && (
							<Box position="absolute" top="2" right="2" style={{ zIndex: 10 }}>
								<Tooltip content="Copy as JSON">
									<Button variant="soft" size="1" onClick={handleCopyJsonData}>
										<Clipboard size={14} />
									</Button>
								</Tooltip>
							</Box>
						)}
					</Box>
				</Flex>
			</Card>

			<Box className="w-full">
				{isError && (
					<Alert type={isError.error ? "error" : "success"} message={isError.message} />
				)}
			</Box>
		</Flex>
	)
}