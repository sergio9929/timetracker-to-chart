<script setup lang="ts">
import {
    Axis,
    Tooltip
} from '@unovis/ts';
import {
    VisAxis,
    VisBulletLegend,
    VisCrosshair,
    VisStackedBar,
    VisTooltip,
    VisXYContainer,
    VisXYLabels
} from '@unovis/vue';

const color = 'var(--primary-color)';
const dayInMiliseconds = 24 * 60 * 60 * 1000;

const data = ref<Session[] | undefined>(undefined);
const total = ref(0)
const displayAllDates = ref(false)
const loading = ref(false)
const dropZoneRef = ref<HTMLDivElement>()

const { isOverDropZone } = useDropZone(dropZoneRef, { onDrop })
const { onChange, open, reset } = useFileDialog({ accept: '.timetracker', multiple: false })

const tickValues = computed(() => data.value ? getIntermediateDates(
    new Date(data.value[0].date),
    new Date(data.value[data.value.length - 1].date)
) : [])
const xAxisLabelAttributes = computed(() => ({
    [Axis.selectors.tick]: {
        class: (d: Session['duration']) => `${Axis.selectors.tick} tick ${displayAllDates.value ? ' chart__tick--x' : ''}`
    }
}))
const legendItems = computed(() => [{ name: `Total: ${formatDuration(total.value)}`, color }])

const x = (d: Session) => d.date;
const y = (d: Session) => d.duration;
const id = (d: Session) => d.date;
const getLabel = (d: Session) => formatDuration(d.duration);
const tooltipTemplate = (d: Session) => `<div><b>${formatDate(d.date)}</b>: ${formatDuration(d.duration)}</div>`
const yAxisLabelY = (d: Session) => Math.max(d.duration - .5, d.duration / 2)
const tooltipAttributes = {
    class: `${Tooltip.selectors.tooltip} chart__tooltip`
}

onChange((files) => onDrop(files))
function onDrop(files: File[] | FileList | null) {
    if (!files) return

    const file = files[0]

    if (file?.name.endsWith('.timetracker')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string)
                const timetracker = transformData(json)
                data.value = timetracker.sessions
                total.value = timetracker.total
            } catch (error) {
                console.error('Error analizing the JSON file:', error)
            }
        };
        reader.readAsText(file)
    } else {
        console.warn('The file is not a valid JSON.')
    }

    reset()
}

// rerender chart
function changeView() {
    loading.value = true
    displayAllDates.value = !displayAllDates.value

    setTimeout(() => {
        loading.value = false
    }, 100)
}
</script>

<template>
    <div ref="dropZoneRef" class="drop-zone" :class="{ 'drop-zone--over': isOverDropZone }" v-auto-animate>
        <div v-if="!data?.length" class="home">
            <p>Drag and drop a <code>.timetracker</code> file </p>
            <p class="home__or">or</p>
            <button class="button button--home home__button" @click="open()">Click here to find it</button>
            <div class="home__extension">
                <p class="home__link-wrapper"><a
                        href="https://marketplace.visualstudio.com/items?itemName=Blade.timetracker" target="_blank"
                        class="home__link">Install the timetracker VS Code extension</a></p>
                <p class="home__info">The extension creates a <code>.timetracker</code> file to store your time tracking
                    data</p>
            </div>
        </div>
        <p v-else-if="loading" class="loading-screen">
            Loading...
        </p>
        <div v-else class="chart">
            <div class="chart__buttons">
                <button class="button button--open-file" @click="open()">
                    Open file
                </button>
                <button class="button button--chnage-view" @click="changeView">
                    Dates: {{ displayAllDates ? 'All' : 'Reduced' }}
                </button>
            </div>
            <VisXYContainer height="100vh" width="100%" :data="data"
                :margin="{ top: 100, right: 50, bottom: 50, left: 50 }">
                <VisBulletLegend :items="legendItems" labelFontSize="16px" class="chart__legend" />
                <VisStackedBar :x="x" :y="y" :dataStep="dayInMiliseconds" :color="color" :roundedCorners="10" :id="id"
                    :width="100" />
                <VisAxis type="x" :tickFormat="formatDate" :tickValues="displayAllDates && tickValues" label="Date"
                    :labelColor="color" :tickTextColor="color" :labelMargin="displayAllDates ? 100 : 50" :tickPadding="10"
                    :tickTextAlign="displayAllDates && 'right'" :tickTextWidth="100" :attributes="xAxisLabelAttributes" />
                <VisAxis type="y" :tickFormat="formatDuration" label="Duration" :labelColor="color" :tickTextColor="color"
                    :labelMargin="50" />
                <VisCrosshair :template="tooltipTemplate" :x="x" :yStacked="[y, undefined]" color="#000000" />
                <VisTooltip horizontalPlacement="center" :attributes="tooltipAttributes" />
                <VisXYLabels :label="getLabel" color="#000000" :backgroundColor="color" :y="yAxisLabelY" :x="x"
                    :labelFontSize="16" />
            </VisXYContainer>
        </div>
    </div>
</template>

<style scoped>
code {
    background-color: var(--transparent-color);
    border-radius: .5em;
    padding: .2em;
    font-family: 'Courier New', Courier, monospace;
    font: inherit;
}

.button {
    border-radius: .5em;
    padding: .5em 1em;
    background-color: var(--primary-color);
    color: var(--background-color);
}

.drop-zone {
    width: 100%;
    height: 100vh;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color .2s;
}

.drop-zone--over {
    background-color: var(--transparent-color);
}

.home {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    text-align: center;
}

.home__or {
    width: 100%;
    display: flex;
    align-items: center;
    line-height: 1;
    gap: .5em;
}

.home__or::before,
.home__or::after {
    content: '';
    display: block;
    border: 1px solid var(--transparent-color);
    width: 100%;
}

.home__extension {
    position: fixed;
    bottom: 50px;
}

.home__link-wrapper {
    margin-bottom: .5em;
}

.home__link {
    color: inherit;
}

.home__info {
    opacity: .6;
}

.chart {
    --vis-axis-grid-color: var(--transparent-color);
    --vis-legend-label-color: var(--primary-color);
    --vis-legend-item-spacing: 0;

    width: 100%;
}

.chart__buttons {
    position: fixed;
    left: 25px;
    top: 25px;
    z-index: 1;
    display: flex;
    gap: .5rem;
}

.chart__legend {
    text-align: center;
    position: fixed;
    top: 40px;
    left: 0;
    right: 0;
}

:deep(.chart__tooltip) {
    background-color: black;
    border-radius: .5em;
    color: white;
    border: 1px solid var(--transparent-color);
    box-shadow: 0 0 .5em var(--transparent-color);
}

:deep(.chart__tick--x) text {
    transform: translateX(-.6%) rotate(-50deg);
}
</style>