import React, { useRef, memo } from 'react'
import Draggable from 'react-draggable'
import { atom, selector, useResetRecoilState, useRecoilValue, useRecoilState } from 'recoil'
import mem from 'mem'
import { randomBetween } from './utils/fns'
import './App.css'

const boxIdsState = atom({
	key: 'boxIdsState',
	default: [],
})

const getBoxState = mem(id =>
	atom({
		key: `boxState${id}`,
		default: {
			x: randomBetween(0, window.innerWidth - 100),
			y: randomBetween(1, window.innerHeight - 100),
		},
	})
)

const totalsState = selector({
	key: 'totalsState',
	get: ({ get }) => {
		const boxIds = get(boxIdsState)
		return boxIds.length
	},
})

const boundingState = selector({
	key: 'boundingState',
	get: ({ get }) => {
		const boxIds = get(boxIdsState)
		const boxes = boxIds.map(id => get(getBoxState(id)))

		const bounding = boxes.reduce(
			(acc, box) => {
				if (acc.minX === null || box.x < acc.minX) acc.minX = box.x
				if (acc.minY === null || box.y < acc.minY) acc.minY = box.y
				if (acc.maxX === null || box.x > acc.maxX) acc.maxX = box.x
				if (acc.maxY === null || box.y > acc.maxY) acc.maxY = box.y
				return acc
			},
			{
				minX: null,
				minY: null,
				maxX: null,
				maxY: null,
			}
		)
		return bounding
	},
})

function Create() {
	const [boxIds, setBoxIds] = useRecoilState(boxIdsState)
	return (
		<button
			onClick={() => {
				const id = new Date().toISOString()
				setBoxIds([...boxIds, id])
			}}
			style={{
				width: 'auto',
				height: '50px',
				color: 'rebeccaPurple',
				backgroundColor: 'yellow',
				fontWeight: 'bold',
				fontSize: '20px',
			}}
		>
			add a div!
		</button>
	)
}

const DrawBox = memo(({ id }) => {
	const [box, setBox] = useRecoilState(getBoxState(id))
	const ref = useRef()
	return (
		<Draggable
			nodeRef={ref}
			position={{ x: box.x, y: box.y }}
			onDrag={(e, data) => {
				setBox({ ...box, x: data.x, y: data.y })
			}}
		>
			<div
				ref={ref}
				style={{
					width: '100px',
					height: '100px',
					color: 'red',
					backgroundColor: 'yellow',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<p>x: {box.x}</p>
				<p>y: {box.y}</p>
			</div>
		</Draggable>
	)
})

function Boxes() {
	const boxIds = useRecoilValue(boxIdsState)
	return (
		<>
			{boxIds.map(id => (
				<DrawBox key={id} id={id} />
			))}
		</>
	)
}

function BoundingBox() {
	const bounding = useRecoilValue(boundingState)
	if (bounding.minX === null) return null
	return (
		<div
			className="boundingBox"
			style={{
				top: bounding.minY,
				left: bounding.minX,
				width: bounding.maxX - bounding.minX + 96,
				height: bounding.maxY - bounding.minY + 96,
			}}
		></div>
	)
}

function BigNumber() {
	const total = useRecoilValue(totalsState)
	return <div className="bigNumber">Box count: {total}</div>
}

export default function App() {
	return (
		<>
			<Create />
			<Boxes />
			<BigNumber />
			<BoundingBox />
		</>
	)
}
