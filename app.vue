<script setup lang="ts">
import {
VisAxis,
VisBulletLegend,
VisCrosshair,
VisStackedBar,
VisTooltip,
VisXYContainer,
VisXYLabels
} from '@unovis/vue';
export type TimeData = {
  date: Date;
  time_unit: string;
  duration: number;
}
export type TimeUnit = 's' | 'm' | 'h';

const data = ref<TimeData[] | undefined>(undefined);
const total = ref(0)

const dayInMiliseconds = 86400000;
const formatDate = (date: Date) => new Date(date).toISOString().split('T')[0];
const formatDuration = (duration: number) => {
  const hours = Math.floor(duration);
  const minutes = Math.round((duration % 1) * 60);

  if (hours === 0) {
    return `${minutes}min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
};

const x = (d: TimeData) => d.date;
const y = (d: TimeData) => d.duration;
const id = (d: TimeData) => d.date;
const getLabel = (d: TimeData) => formatDuration(d.duration);

const color = '#ffffff';

const tickValues = computed(() => data.value ? getIntermediateDates(
  new Date(data.value[0].date),
  new Date(data.value[data.value.length - 1].date)
) : []);

function tooltipTemplate(d: TimeData): string {
  return `<div><b>${formatDate(d.date)}</b>: ${formatDuration(d.duration)}</div>`
}

function getIntermediateDates(startDate: Date, endDate: Date): Date[] {
  const intermediateDates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    intermediateDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return intermediateDates;
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  const file = event.dataTransfer?.files[0]; // Obtén el primer archivo soltado

  if (file?.name.endsWith('.timetracker')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        data.value = transformData(json);
      } catch (error) {
        console.error('Error al analizar el archivo JSON:', error);
      }
    };
    reader.readAsText(file);
  } else {
    console.warn('El archivo no es un JSON válido.');
  }
};

function transformData(json: Record<string, any>): TimeData[] {
  const time_unit: TimeUnit = 'h';
  const groupedObject: Record<string, any> = {}

  if (json.sessions?.length) {
    total.value = transformDuration(json.total, time_unit)
    for (const item of json.sessions) {
      var inputDate = new Date(item.begin);
      inputDate.setHours(0, 0, 0, 0)

      const date = inputDate.toISOString()
      if (!groupedObject[date]) {
        groupedObject[date] = []
      }
      groupedObject[date].push(item)
    }
  }

  const finalArray = Object.entries(groupedObject).map(([date, item]) => {
    const duration = item?.reduce((acc: number, e: any) => acc + transformDuration(e.duration, time_unit), 0)

    return {
      date: new Date(date),
      time_unit,
      duration: Math.round(duration * 100) / 100
    }
  })

  return finalArray
}

function transformDuration(duration: number, time_unit: TimeUnit = 'h'): number {
  switch (time_unit) {
    case 's':
      return duration
    case 'm':
      return duration / 60
    case 'h':
      return duration / 60 / 60
    default:
      return 0
  }
}
</script>

<template>
  <div @dragover.prevent @drop="handleDrop">
    <div v-if="!data" ref="dropZone" class="drop-zone">
      Arrastra y suelta un archivo JSON aquí
    </div>
    <VisXYContainer v-else height="100vh" width="100%" :data="data"
      :margin="{ top: 100, right: 50, bottom: 50, left: 50 }">
      <VisBulletLegend :items="[{ name: `Total: ${formatDuration(total)}`, color }]" labelFontSize="16px"
        class="legend" />
      <VisStackedBar :x="x" :y="y" :dataStep="dayInMiliseconds" :color="color" :roundedCorners="10" :id="id" />
      <VisAxis type="x" tickTextFitMode="trim" tickTextTrimType="end" :tickFormat="formatDate" :tickValues="tickValues"
        label="Fecha" :labelColor="color" :tickTextColor="color" :labelMargin="50" />
      <VisAxis type="y" :tickFormat="formatDuration" label="Tiempo" :labelColor="color" :tickTextColor="color"
        :labelMargin="50" />
      <VisCrosshair :template="tooltipTemplate" :x="x" :yStacked="[y, undefined]" color="#000000" />
      <VisTooltip horizontalPlacement="center" :attributes="{
        class: `css-1sev1n1-tooltip sample-tooltip`
      }" />
      <VisXYLabels :label="getLabel" color="#000000" :backgroundColor="color"
        :y="(d: any) => Math.max(d.duration - .5, d.duration / 2)" :x="x" :labelFontSize="16" />
    </VisXYContainer>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

body {
  background-color: black;
}

:root {
  --vis-axis-grid-color: hsl(0 0 100% / 20%);
  --vis-legend-label-color: white
}

.legend {
  text-align: center;
  position: fixed;
  top: 40px;
  left: 0;
  right: 0;
}

.sample-tooltip {
  background-color: black;
  border-radius: .5em;
  color: white;
  border: 1px solid hsl(0 0 100% / 20%);
  box-shadow: 0 0 .5em hsl(0 0 100% / 20%);
}

.drop-zone {
  width: 100%;
  height: 100vh;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>