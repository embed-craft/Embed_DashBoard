import React, { useState } from 'react';
import {
  Key,
  Code,
  Copy,
  Shield,
  Smartphone,
  Check
} from "lucide-react";
import { toast } from "sonner";

import PageHeader from "@/components/layout/PageHeader";
import PageContainer from "@/components/layout/PageContainer";
import { theme } from "@/styles/design-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const ApiPage = () => {
  const { user } = useAuth();
  const apiKey = user?.organization?.api_key || "pk_live_placeholder_key";
  const [activeTab, setActiveTab] = useState("api");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API Key copied to clipboard");
  };

  // Simulator State
  const [simUserId, setSimUserId] = useState("test_user_1");
  const [simTraits, setSimTraits] = useState('{\n  "tier": "gold",\n  "location": "New York"\n}');
  const [simEventName, setSimEventName] = useState("Product Viewed");
  const [simEventProps, setSimEventProps] = useState('{\n  "price": 99.99,\n  "currency": "USD"\n}');
  const [simScreenName, setSimScreenName] = useState("home");
  const [logs, setLogs] = useState<any[]>([]);
  const [simNudgeData, setSimNudgeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Hardcoded API URL for simulator
  const API_URL = `${(import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '')}/api/v1`;

  const addLog = (type: 'req' | 'res' | 'err', message: string, data?: any) => {
    setLogs(prev => [{
      type,
      message,
      data,
      time: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const handleSimulateIdentify = async () => {
    setLoading(true);
    try {
      let traits = {};
      try {
        traits = JSON.parse(simTraits);
      } catch (e) {
        throw new Error("Invalid JSON in Traits");
      }

      addLog('req', 'Identifying user...', { userId: simUserId, traits });

      const response = await fetch(`${API_URL}/nudge/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          userId: simUserId,
          traits
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }

      if (!response.ok) throw new Error(data.error || 'Request failed');
      addLog('res', 'Identify successful', data);
      toast.success("User identified successfully");
    } catch (error: any) {
      addLog('err', 'Identify failed', error.message);
      toast.error(`Identify failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTrack = async () => {
    setLoading(true);
    try {
      let properties = {};
      try {
        properties = JSON.parse(simEventProps);
      } catch (e) {
        throw new Error("Invalid JSON in Properties");
      }

      addLog('req', `Tracking event: ${simEventName}`, { userId: simUserId, properties });

      const response = await fetch(`${API_URL}/nudge/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          action: simEventName,
          userId: simUserId,
          metadata: properties
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }

      if (!response.ok) throw new Error(data.error || 'Request failed');
      addLog('res', 'Event tracked successfully', data);
      toast.success("Event tracked successfully");
    } catch (error: any) {
      addLog('err', 'Track failed', error.message);
      toast.error(`Track failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFetch = async () => {
    setLoading(true);
    setSimNudgeData(null); // Reset previous nudge
    addLog('req', `Fetching nudges for screen: ${simScreenName}`);
    try {
      const response = await fetch(`${API_URL}/nudge/fetch?userId=${simUserId}&screenName=${simScreenName}&platform=web`, {
        headers: {
          'x-api-key': apiKey
        }
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) throw new Error(data.error || 'Request failed');

      if (data.data) {
        addLog('res', `Fetch complete. Nudge found: ${data.data.campaign_name}`, data.data);
        setSimNudgeData(data.data);
        toast.success(`Nudge found: ${data.data.campaign_name}`);
      } else {
        addLog('res', 'Fetch complete. No nudge found.', data);
        toast.info("No nudges found for this user/screen");
      }
    } catch (error: any) {
      addLog('err', 'Fetch failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
      <PageHeader
        title="API & SDK"
        subtitle="Manage your API keys and integrate the SDK into your app"
      />

      <PageContainer>
        <div className="flex flex-col gap-6">
          {/* Custom Tab List */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${theme.colors.border.default}`,
            marginBottom: '8px'
          }}>
            <button
              onClick={() => setActiveTab("api")}
              className={`group flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all outline-none ${activeTab === "api"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Key size={16} className={activeTab === "api" ? "text-blue-600" : ""} />
              API Configuration
            </button>
            <button
              onClick={() => setActiveTab("sdk")}
              className={`group flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all outline-none ${activeTab === "sdk"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Code size={16} className={activeTab === "sdk" ? "text-blue-600" : ""} />
              SDK Integration
            </button>
            <button
              onClick={() => setActiveTab("callbacks")}
              className={`group flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all outline-none ${activeTab === "callbacks"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Code size={16} className={activeTab === "callbacks" ? "text-blue-600" : ""} />
              Callbacks
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`group flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all outline-none ${activeTab === "simulator"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Smartphone size={16} className={activeTab === "simulator" ? "text-blue-600" : ""} />
              Simulator
            </button>
          </div>

          {/* API Content */}
          {activeTab === "api" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div style={{
                backgroundColor: 'white',
                borderRadius: theme.borderRadius.lg,
                border: `1px solid ${theme.colors.border.default}`,
                padding: '32px',
                maxWidth: '800px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: theme.colors.primary[50], color: theme.colors.primary[600] }}>
                    <Key size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary }}>API Keys</h3>
                    <p style={{ fontSize: '14px', color: theme.colors.text.secondary }}>Manage your API keys for backend integration</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Production API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="apiKey"
                          value={apiKey}
                          readOnly
                          className="font-mono text-sm pr-10 bg-gray-50"
                        />
                        <Shield size={14} className="absolute right-3 top-3 text-green-600" />
                      </div>
                      <Button variant="outline" onClick={copyToClipboard} className="gap-2">
                        <Copy size={14} />
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use this key to authenticate API requests from your backend. Keep it secret!
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Code size={14} />
                      API Endpoints
                    </p>
                    <div className="space-y-2 text-xs font-mono text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">POST</span>
                        /v1/track - Track events
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">POST</span>
                        /v1/identify - Identify users
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">GET</span>
                        /v1/campaigns - Fetch campaigns
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SDK Content */}
          {activeTab === "sdk" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div style={{
                backgroundColor: 'white',
                borderRadius: theme.borderRadius.lg,
                border: `1px solid ${theme.colors.border.default}`,
                padding: '32px',
                maxWidth: '800px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: theme.colors.primary[50], color: theme.colors.primary[600] }}>
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary }}>SDK Integration</h3>
                    <p style={{ fontSize: '14px', color: theme.colors.text.secondary }}>Install the SDK in your mobile application</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs">1</span>
                      Android Integration
                    </h4>
                    <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-800 relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                        onClick={() => {
                          navigator.clipboard.writeText(`// 1. Add dependency in build.gradle\ndependencies {\n    implementation 'com.nudgeplatform:sdk:1.0.0'\n}\n\n// 2. Initialize in Application.java\npublic class MyApp extends Application {\n    @Override\n    public void onCreate() {\n        super.onCreate();\n        NudgePlatform.initialize(this, "${apiKey}");\n    }\n}`);
                          toast.success("Code copied");
                        }}
                      >
                        <Copy size={14} />
                      </Button>
                      <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                        {`// 1. Add dependency in build.gradle
dependencies {
    implementation 'com.nudgeplatform:sdk:1.0.0'
}

// 2. Initialize in Application.java
public class MyApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        NudgePlatform.initialize(this, "${apiKey}");
    }
}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs">2</span>
                      iOS Integration
                    </h4>
                    <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-800 relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                        onClick={() => {
                          navigator.clipboard.writeText(`// 1. Add pod in Podfile\npod 'NudgePlatform', '~> 1.0'\n\n// 2. Initialize in AppDelegate.swift\nfunc application(...) -> Bool {\n    NudgePlatform.initialize(apiKey: "${apiKey}")\n    return true\n}`);
                          toast.success("Code copied");
                        }}
                      >
                        <Copy size={14} />
                      </Button>
                      <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                        {`// 1. Add pod in Podfile
pod 'NudgePlatform', '~> 1.0'

// 2. Initialize in AppDelegate.swift
func application(...) -> Bool {
    NudgePlatform.initialize(apiKey: "${apiKey}")
    return true
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Callbacks Content */}
          {activeTab === "callbacks" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div style={{
                backgroundColor: 'white',
                borderRadius: theme.borderRadius.lg,
                border: `1px solid ${theme.colors.border.default}`,
                padding: '32px',
                maxWidth: '800px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: theme.colors.primary[50], color: theme.colors.primary[600] }}>
                    <Code size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary }}>Callbacks & Listeners</h3>
                    <p style={{ fontSize: '14px', color: theme.colors.text.secondary }}>Listen and respond to Nudge SDK events in your app</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Integration Guide */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Integration Guide</h4>
                    <p className="text-sm text-gray-600">
                      To listen to events triggered by the Nudge SDK, you need to implement the <code className="bg-gray-100 px-1 py-0.5 rounded text-red-500">NudgeCallbackListener</code> interface.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                          <span className="text-sm font-medium">Implement Nudge Callback</span>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-800 relative group">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(`class _HomePageState extends State<HomePage>\n    with SingleTickerProviderStateMixin implements NudgeCallbackListener {\n  ...\n}`);
                              toast.success("Code copied");
                            }}
                          >
                            <Copy size={14} />
                          </Button>
                          <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                            {`class _HomePageState extends State<HomePage>
    with SingleTickerProviderStateMixin implements NudgeCallbackListener {
  ...
}`}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
                          <span className="text-sm font-medium">Register the Callback</span>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-800 relative group">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(`@Override\nvoid initState() {\n  super.initState();\n  NudgeCallbackManager.registerListener(this);\n}`);
                              toast.success("Code copied");
                            }}
                          >
                            <Copy size={14} />
                          </Button>
                          <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                            {`@Override
void initState() {
  super.initState();
  NudgeCallbackManager.registerListener(this);
}`}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
                          <span className="text-sm font-medium">Listening to Events</span>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-800 relative group">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(`@override\nvoid onEvent(NudgeCallbackData event) {\n  print("callback event: \${event}");\n  switch (event.type) {\n    case "CORE":\n      break;\n    case "UI":\n      break;\n    default:\n      break;\n  }\n}`);
                              toast.success("Code copied");
                            }}
                          >
                            <Copy size={14} />
                          </Button>
                          <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                            {`@override
void onEvent(NudgeCallbackData event) {
  print("callback event: \${event}");
  switch (event.type) {
    case "CORE":
      break;
    case "UI":
      break;
    default:
      break;
  }
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  {/* Schema */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">NudgeCallbackData Schema</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 font-medium text-gray-700">Field</th>
                            <th className="px-4 py-3 font-medium text-gray-700">Type</th>
                            <th className="px-4 py-3 font-medium text-gray-700">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-3 font-mono text-blue-600">data</td>
                            <td className="px-4 py-3 font-mono text-gray-500">Map&lt;String, dynamic&gt;</td>
                            <td className="px-4 py-3 text-gray-600">Payload containing event-specific data</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-blue-600">type</td>
                            <td className="px-4 py-3 font-mono text-gray-500">String</td>
                            <td className="px-4 py-3 text-gray-600">Type of event (CORE or UI)</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-blue-600">action</td>
                            <td className="px-4 py-3 font-mono text-gray-500">String</td>
                            <td className="px-4 py-3 text-gray-600">Specific action associated with the event</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-blue-600">method</td>
                            <td className="px-4 py-3 font-mono text-gray-500">String</td>
                            <td className="px-4 py-3 text-gray-600">Method or source that triggered the event</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  {/* Core Callbacks */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Core Callbacks</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 font-medium text-gray-700 w-1/3">Callback Action</th>
                            <th className="px-4 py-3 font-medium text-gray-700 w-1/3">Callback Data</th>
                            <th className="px-4 py-3 font-medium text-gray-700 w-1/3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-600">NUDGE_INITIALISED</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{`{ sdk_version: string }`}</td>
                            <td className="px-4 py-3 text-gray-600">SDK Initialisation</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-600">NUDGE_USER_IDENTIFIER_SUCCESS</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{`{ user_details: { ... } }`}</td>
                            <td className="px-4 py-3 text-gray-600">User Identification Success</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-600">NUDGE_USER_IDENTIFIER_FAILURE</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{`{ error: string, ... }`}</td>
                            <td className="px-4 py-3 text-gray-600">User Identification Failure</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-600">NUDGE_TRACK_EVENT</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{`{ event: string, ... }`}</td>
                            <td className="px-4 py-3 text-gray-600">Tracking Events Success</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-purple-600">NUDGE_REWARD_RECEIVED</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{`{ rewards: object[] }`}</td>
                            <td className="px-4 py-3 text-gray-600">Reward Received</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  {/* UI Callbacks */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">UI Callbacks</h4>
                    <p className="text-sm text-gray-600 mb-4">Events triggered by user interactions with Nudges (Floater, Banners, In-App, etc.)</p>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 font-medium text-gray-700 w-1/3">Callback Action</th>
                            <th className="px-4 py-3 font-medium text-gray-700 w-1/3">Callback Data</th>
                            <th className="px-4 py-3 font-medium text-gray-700 w-1/3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-3 font-mono text-pink-600">NUDGE_EXPERIENCE_OPEN</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{`{ CAMPAIGN_ID, DISPLAY_TYPE ... }`}</td>
                            <td className="px-4 py-3 text-gray-600">Experience Visible to User</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-pink-600">NUDGE_EXPERIENCE_DISMISS</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{`{ CAMPAIGN_ID, DISPLAY_TYPE ... }`}</td>
                            <td className="px-4 py-3 text-gray-600">Experience is Dismissed</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-pink-600">NUDGE_COMPONENT_CTA_CLICK</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{`{ TARGET, WIDGET_ID, CLICK_TYPE ... }`}</td>
                            <td className="px-4 py-3 text-gray-600">User Clicks on any Widget</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-mono text-pink-600">NUDGE_FLOATER_EXPANDED</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{`{ CAMPAIGN_ID, DISPLAY_ID ... }`}</td>
                            <td className="px-4 py-3 text-gray-600">Floater Expanded</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Simulator Content */}
          {activeTab === "simulator" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div style={{
                backgroundColor: 'white',
                borderRadius: theme.borderRadius.lg,
                border: `1px solid ${theme.colors.border.default}`,
                padding: '32px',
                maxWidth: '800px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: theme.colors.primary[50], color: theme.colors.primary[600] }}>
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary }}>SDK Simulator</h3>
                    <p style={{ fontSize: '14px', color: theme.colors.text.secondary }}>Test your integration without a real device</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Controls */}
                  <div className="space-y-8">
                    {/* 1. Identify */}
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</span>
                        Identify User
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">User ID</Label>
                          <Input
                            placeholder="e.g. user_123"
                            value={simUserId}
                            onChange={(e) => setSimUserId(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Traits (JSON)</Label>
                          <textarea
                            className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                            rows={3}
                            placeholder='{ "tier": "gold", "name": "John" }'
                            value={simTraits}
                            onChange={(e) => setSimTraits(e.target.value)}
                          />
                        </div>
                        <Button size="sm" onClick={handleSimulateIdentify} disabled={loading}>
                          {loading ? 'Sending...' : 'Simulate Identify'}
                        </Button>
                      </div>
                    </div>

                    {/* 2. Track Event */}
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs">2</span>
                        Track Event
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Event Name</Label>
                          <Input
                            placeholder="e.g. Added to Cart"
                            value={simEventName}
                            onChange={(e) => setSimEventName(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Properties (JSON)</Label>
                          <textarea
                            className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                            rows={3}
                            placeholder='{ "price": 99.99 }'
                            value={simEventProps}
                            onChange={(e) => setSimEventProps(e.target.value)}
                          />
                        </div>
                        <Button size="sm" variant="outline" onClick={handleSimulateTrack} disabled={loading}>
                          Track Event
                        </Button>
                      </div>
                    </div>

                    {/* 3. Fetch Nudge */}
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs">3</span>
                        Fetch Nudge
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Screen Name</Label>
                          <Input
                            placeholder="e.g. home_screen"
                            value={simScreenName}
                            onChange={(e) => setSimScreenName(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={handleSimulateFetch} disabled={loading}>
                          Fetch Nudge
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Logs */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Simulator Logs</Label>
                      <Button variant="ghost" size="xs" onClick={() => setLogs([])} className="h-6 text-xs text-muted-foreground">
                        Clear
                      </Button>
                    </div>
                    <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-y-auto max-h-[600px] shadow-inner mb-4">
                      {logs.length === 0 ? (
                        <span className="text-gray-600 italic">Ready to simulate...</span>
                      ) : (
                        logs.map((log, i) => (
                          <div key={i} className="mb-3 border-b border-gray-800 pb-2 last:border-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] px-1 rounded ${log.type === 'req' ? 'bg-blue-900 text-blue-200' :
                                log.type === 'res' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                                }`}>
                                {log.type.toUpperCase()}
                              </span>
                              <span className="text-gray-500">{log.time}</span>
                            </div>
                            <div className="break-all whitespace-pre-wrap">{log.message}</div>
                            {log.data && (
                              <pre className="mt-1 text-gray-500 overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Far Right Column: Phone Simulator */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-between mb-2 w-full">
                      <Label>Visual Preview</Label>
                    </div>

                    {/* Phone Frame */}
                    <div style={{
                      width: '300px',
                      height: '600px',
                      backgroundColor: '#fff',
                      borderRadius: '40px',
                      border: '12px solid #1a1a1a',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                      {/* Notch */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '120px',
                        height: '25px',
                        backgroundColor: '#1a1a1a',
                        borderBottomLeftRadius: '16px',
                        borderBottomRightRadius: '16px',
                        zIndex: 50
                      }}></div>

                      {/* Screen Content */}
                      <div className="w-full h-full relative bg-gray-100 overflow-hidden">
                        {/* Status Bar Placeholder */}
                        <div className="h-8 w-full flex justify-between items-center px-6 text-[10px] font-bold text-gray-800 pt-2">
                          <span>9:41</span>
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                            <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                          </div>
                        </div>

                        {/* App Content Placeholder */}
                        <div className="p-4 space-y-4 opacity-20 pointer-events-none">
                          <div className="h-32 bg-gray-300 rounded-lg"></div>
                          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-24 bg-gray-300 rounded"></div>
                          <div className="h-24 bg-gray-300 rounded"></div>
                        </div>
                      </div>

                      {/* Nudge Rendering Layer */}
                      {simNudgeData && (() => {
                        // Helper to normalize data: If layers exist, use them. If not, construct layers from config (Smart Nudge)
                        let layersToRender = simNudgeData.layers || [];

                        if (layersToRender.length === 0 && simNudgeData.config) {
                          const { config } = simNudgeData;
                          // Construct layers from config for preview
                          if (config.text) {
                            layersToRender.push({
                              type: 'text',
                              props: { text: config.text },
                              style: {
                                top: config.textPositionY || 10,
                                left: config.textPositionX || 5,
                                width: config.textWidth === 'auto' ? 90 : parseInt(config.textWidth) || 90,
                                height: config.textHeight === 'auto' ? 20 : parseInt(config.textHeight) || 20,
                                color: config.textColor || '#000',
                                fontSize: config.fontSize || 16,
                                fontWeight: config.fontWeight || 'normal',
                                textAlign: config.textAlign || 'left',
                                zIndex: 2
                              }
                            });
                          }

                          if (config.image) {
                            layersToRender.push({
                              type: 'image',
                              props: { src: config.image },
                              style: {
                                top: 30, // Default position for smart nudge image
                                left: 5,
                                width: 90,
                                height: 40,
                                zIndex: 1
                              }
                            });
                          }

                          if (config.primaryButtonText) {
                            layersToRender.push({
                              type: 'button',
                              props: { text: config.primaryButtonText },
                              style: {
                                top: 80,
                                left: 5,
                                width: 90,
                                height: 12,
                                backgroundColor: config.primaryButtonColor || '#000',
                                color: config.primaryButtonTextColor || '#fff',
                                borderRadius: config.buttonRadius || 4,
                                zIndex: 3
                              }
                            });
                          }
                        }

                        return (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 40,
                            pointerEvents: 'none', // Allow clicks to pass through for now
                            display: 'flex',
                            alignItems: (simNudgeData.config?.position === 'bottom' || simNudgeData.config?.type === 'bottomsheet') ? 'flex-end' :
                              simNudgeData.config?.position === 'top' ? 'flex-start' : 'center',
                            justifyContent: 'center',
                            backgroundColor: simNudgeData.config?.type === 'modal' ? 'rgba(0,0,0,0.5)' : 'transparent'
                          }}>
                            {/* Nudge Container */}
                            <div style={{
                              position: 'relative',
                              width: simNudgeData.config?.width || (simNudgeData.config?.type === 'modal' ? '80%' : '100%'),
                              height: simNudgeData.config?.height === 'auto' ? 'auto' : (simNudgeData.config?.height || 'auto'),
                              minHeight: simNudgeData.config?.height === 'auto' ? '300px' : undefined, // Prevent collapse for absolute layers
                              backgroundColor: simNudgeData.config?.backgroundColor || 'white',
                              borderRadius: simNudgeData.config?.borderRadius || (simNudgeData.config?.type === 'bottomsheet' ? '20px 20px 0 0' : '8px'),
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              overflow: 'hidden',
                              margin: simNudgeData.config?.type === 'banner' ? '0' : (simNudgeData.config?.type === 'bottomsheet' ? '0' : '20px'),
                              padding: '0' // Layers are absolute positioned usually
                            }}>
                              {/* Render Layers */}
                              {layersToRender.map((layer: any, idx: number) => (
                                <div key={idx} style={{
                                  position: 'absolute',
                                  top: `${layer.style?.top}%`,
                                  left: `${layer.style?.left}%`,
                                  width: `${layer.style?.width}%`,
                                  height: `${layer.style?.height}%`,
                                  backgroundColor: layer.style?.backgroundColor,
                                  color: layer.style?.color,
                                  fontSize: `${layer.style?.fontSize}px`,
                                  fontWeight: layer.style?.fontWeight,
                                  textAlign: layer.style?.textAlign as any,
                                  borderRadius: `${layer.style?.borderRadius}px`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: layer.style?.textAlign === 'center' ? 'center' : 'flex-start',
                                  overflow: 'hidden',
                                  zIndex: layer.style?.zIndex || 1
                                }}>
                                  {layer.type === 'text' && layer.props?.text}
                                  {layer.type === 'button' && (
                                    <button style={{
                                      width: '100%',
                                      height: '100%',
                                      backgroundColor: layer.style?.backgroundColor || '#000',
                                      color: layer.style?.color || '#fff',
                                      border: 'none',
                                      borderRadius: `${layer.style?.borderRadius || 4}px`,
                                      fontSize: `${layer.style?.fontSize || 14}px`
                                    }}>
                                      {layer.props?.text || 'Button'}
                                    </button>
                                  )}
                                  {layer.type === 'image' && (
                                    <img
                                      src={layer.props?.src || 'https://via.placeholder.com/150'}
                                      alt="Nudge Asset"
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContainer >
    </div >
  );
};

export default ApiPage;
