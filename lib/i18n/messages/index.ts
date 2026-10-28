import type { Locale } from "../config";

import { common as enCommon } from "./en/common";
import { common as esCommon } from "./es/common";
import { landing as enLanding } from "./en/landing";
import { landing as esLanding } from "./es/landing";
import { pages as enPages } from "./en/pages";
import { pages as esPages } from "./es/pages";
import { auth as enAuth } from "./en/auth";
import { auth as esAuth } from "./es/auth";
import { academy as enAcademy, loading as enLoading } from "./en/academy";
import { academy as esAcademy, loading as esLoading } from "./es/academy";
import { shell as enShell } from "./en/shell";
import { shell as esShell } from "./es/shell";
import { dashCommon as enDashCommon, home as enHome } from "./en/home";
import { dashCommon as esDashCommon, home as esHome } from "./es/home";
import { agents as enAgents } from "./en/agents";
import { agents as esAgents } from "./es/agents";
import { billing as enBilling } from "./en/billing";
import { billing as esBilling } from "./es/billing";
import { docs as enDocs } from "./en/docs";
import { docs as esDocs } from "./es/docs";
import { integrations as enIntegrations } from "./en/integrations";
import { integrations as esIntegrations } from "./es/integrations";
import { agentDetail as enAgentDetail } from "./en/agentDetail";
import { agentDetail as esAgentDetail } from "./es/agentDetail";
import { agentPages as enAgentPages } from "./en/agentPages";
import { agentPages as esAgentPages } from "./es/agentPages";
import { errors as enErrors } from "./en/errors";
import { errors as esErrors } from "./es/errors";
import { knowledge as enKnowledge } from "./en/knowledge";
import { knowledge as esKnowledge } from "./es/knowledge";
import { analytics as enAnalytics } from "./en/analytics";
import { analytics as esAnalytics } from "./es/analytics";
import { integrationPages as enIntegrationPages } from "./en/integrationPages";
import { integrationPages as esIntegrationPages } from "./es/integrationPages";
import { api as enApi } from "./en/api";
import { api as esApi } from "./es/api";
import { channels as enChannels } from "./en/channels";
import { channels as esChannels } from "./es/channels";
import {
  widgetEditor as enWidgetEditor,
  widgetTemplatesCopy as enWidgetTemplatesCopy,
} from "./en/widgetEditor";
import {
  widgetEditor as esWidgetEditor,
  widgetTemplatesCopy as esWidgetTemplatesCopy,
} from "./es/widgetEditor";

const en = {
  ...enCommon,
  ...enPages,
  landing: enLanding,
  auth: enAuth,
  academy: enAcademy,
  loading: enLoading,
  shell: enShell,
  dashCommon: enDashCommon,
  home: enHome,
  agents: enAgents,
  billing: enBilling,
  docs: enDocs,
  integrations: enIntegrations,
  agentDetail: enAgentDetail,
  agentPages: enAgentPages,
  errors: enErrors,
  knowledge: enKnowledge,
  analytics: enAnalytics,
  integrationPages: enIntegrationPages,
  api: enApi,
  channels: enChannels,
  widgetEditor: enWidgetEditor,
  widgetTemplates: enWidgetTemplatesCopy,
};

export type Messages = typeof en;

const es: Messages = {
  ...esCommon,
  ...esPages,
  landing: esLanding,
  auth: esAuth,
  academy: esAcademy,
  loading: esLoading,
  shell: esShell,
  dashCommon: esDashCommon,
  home: esHome,
  agents: esAgents,
  billing: esBilling,
  docs: esDocs,
  integrations: esIntegrations,
  agentDetail: esAgentDetail,
  agentPages: esAgentPages,
  errors: esErrors,
  knowledge: esKnowledge,
  analytics: esAnalytics,
  integrationPages: esIntegrationPages,
  api: esApi,
  channels: esChannels,
  widgetEditor: esWidgetEditor,
  widgetTemplates: esWidgetTemplatesCopy,
};

const messages: Record<Locale, Messages> = { en, es };

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
