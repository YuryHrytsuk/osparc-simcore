{{- define "simcore-service.name" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "simcore-service.envSecretName" -}}
{{- printf "%s-env" (include "simcore-service.name" . | trunc 58 | trimSuffix "-") -}}
{{- end -}}

{{- define "simcore-service.labels" -}}
app.kubernetes.io/name: {{ include "simcore-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
{{- end -}}

{{- define "simcore-service.containerEnv" -}}
{{- range $name, $v := .Values.env }}
{{- if not (kindIs "invalid" $v) }}
- name: {{ $name }}
  {{- if kindIs "map" $v }}
  {{- toYaml $v | nindent 2 }}
  {{- else }}
  value: {{ $v | toString | quote }}
  {{- end }}
{{- end }}
{{- end }}
{{- end -}}
