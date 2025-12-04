import useGame from "../hooks/useGame";
import useInterval from "../hooks/useInterval";

export default function Pipes() {
  const {
    isStarted,
    pipe: { delay },
    pipes: pipesArray,
    movePipes,
  } = useGame();
  useInterval(() => movePipes(), isStarted ? delay : null);
  return (
    <>
      {pipesArray.map((pipes, index) => (
        <>
          <div
            key={pipes.top.key}
            style={{
              position: 'absolute',
              left: pipes.top.position.x,
              top: pipes.top.position.y,
              width: pipes.top.size.width,
              height: pipes.top.size.height,
              transform: 'rotate(180deg)',
            }}
            children={<Pipe />}
          />
          <div
            key={pipes.bottom.key}
            style={{
              position: 'absolute',
              left: pipes.bottom.position.x,
              top: pipes.bottom.position.y,
              width: pipes.bottom.size.width,
              height: pipes.bottom.size.height,
            }}
            children={<Pipe />}
          />
        </>
      ))}
    </>
  );
}
export function Pipe() {
  return (
    <img src="pipe.png" className="h-full w-1/2 pointer-events-none" alt="" />
  );
}
