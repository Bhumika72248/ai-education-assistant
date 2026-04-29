import { useMemo, useEffect, useRef, useState } from "react";
import PathNode from "./PathNode";

export default function SnakePath({ pathData, viewMode, onNodeClick }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(800); // default fallback

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Compute layout
  const layout = useMemo(() => {
    if (!pathData || !pathData.weeks) return { nodes: [], svgPath: "", completedPath: "", height: 0 };
    
    const rowHeight = 180;
    const paddingX = 80;
    const paddingTop = 100;
    const availableWidth = width - (paddingX * 2);
    
    let currentY = paddingTop;
    let nodes = [];
    let pathD = "";
    let completedD = "";
    let isCompletedPathContiguous = true;
    
    // Flatten tasks into nodes
    let nodeIndex = 0;
    let firstIncompleteFound = false;

    // Start node
    nodes.push({
      id: 'start',
      x: paddingX,
      y: currentY - 60,
      isStart: true,
      weekNumber: 0,
      dayNumber: 0,
      task: { topic_name: 'START', completed: true, task_type: 'learn' }
    });
    pathD += `M ${paddingX} ${currentY - 60} L ${paddingX} ${currentY}`;
    completedD += `M ${paddingX} ${currentY - 60} L ${paddingX} ${currentY}`;

    for (let w = 0; w < pathData.weeks.length; w++) {
      const week = pathData.weeks[w];
      const isLeftToRight = w % 2 === 0;
      
      const totalDays = week.days.length;
      const stepX = totalDays > 1 ? availableWidth / (totalDays - 1) : 0;

      for (let d = 0; d < week.days.length; d++) {
        const day = week.days[d];
        const task = day.tasks[0]; // Simplifying: one main node per day
        
        let x = isLeftToRight 
          ? paddingX + (d * stepX)
          : paddingX + availableWidth - (d * stepX);
          
        let y = currentY;

        let isCurrent = false;
        if (!task.completed && !firstIncompleteFound) {
          isCurrent = true;
          firstIncompleteFound = true;
        }

        nodes.push({
          id: task.id,
          x, y,
          task,
          weekNumber: week.week_number,
          dayNumber: day.day_number,
          isCurrent,
          weekIdx: w,
          dayIdx: d
        });

        if (w === 0 && d === 0) {
           // first real node is already at x,y. Let's start the path from here instead of moving.
           // actually, path started from 'START' node.
        }

        if (d > 0) {
          const prevX = isLeftToRight ? paddingX + ((d-1) * stepX) : paddingX + availableWidth - ((d-1) * stepX);
          pathD += ` L ${x} ${y}`;
          if (task.completed && isCompletedPathContiguous) {
             completedD += ` L ${x} ${y}`;
          } else {
             isCompletedPathContiguous = false;
          }
        }
      }

      // Add week milestone
      const milestoneX = isLeftToRight ? paddingX + availableWidth : paddingX;
      nodes.push({
        id: `milestone-${w}`,
        x: milestoneX,
        y: currentY + 40,
        isMilestone: true,
        weekNumber: week.week_number,
        milestoneText: week.milestone,
        task: { completed: week.days.every(d => d.tasks.every(t => t.completed)) }
      });

      // Arc to next row if not last week
      if (w < pathData.weeks.length - 1) {
        const nextY = currentY + rowHeight;
        const arcRadius = rowHeight / 2;
        const endX = milestoneX; // starts moving down
        
        // Quadratic bezier to curve down
        if (isLeftToRight) {
          pathD += ` Q ${milestoneX + 40} ${currentY} ${milestoneX + 40} ${currentY + arcRadius}`;
          pathD += ` Q ${milestoneX + 40} ${nextY} ${milestoneX} ${nextY}`;
          
          if (nodes[nodes.length-1].task.completed && isCompletedPathContiguous) {
             completedD += ` Q ${milestoneX + 40} ${currentY} ${milestoneX + 40} ${currentY + arcRadius}`;
             completedD += ` Q ${milestoneX + 40} ${nextY} ${milestoneX} ${nextY}`;
          }
        } else {
          pathD += ` Q ${milestoneX - 40} ${currentY} ${milestoneX - 40} ${currentY + arcRadius}`;
          pathD += ` Q ${milestoneX - 40} ${nextY} ${milestoneX} ${nextY}`;
          
          if (nodes[nodes.length-1].task.completed && isCompletedPathContiguous) {
             completedD += ` Q ${milestoneX - 40} ${currentY} ${milestoneX - 40} ${currentY + arcRadius}`;
             completedD += ` Q ${milestoneX - 40} ${nextY} ${milestoneX} ${nextY}`;
          }
        }
        currentY = nextY;
      } else {
        // End node
        nodes.push({
          id: 'end',
          x: milestoneX,
          y: currentY + 180,
          isEnd: true,
          goalText: pathData.goal,
          task: { completed: false }
        });
        pathD += ` L ${milestoneX} ${currentY + 180}`;
      }
    }

    return { nodes, pathD, completedD, height: currentY + 320 };
  }, [pathData, width]);

  if (viewMode === "this-week") {
    // Basic filter for 'this-week'
    // For simplicity, we just CSS transform scale to zoom into the current week.
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-visible" style={{ height: layout.height, minHeight: layout.height }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {/* Background Path */}
        <path 
          d={layout.pathD} 
          fill="none" 
          stroke="#e2e8f0" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Completed Path */}
        <path 
          d={layout.completedD} 
          fill="none" 
          stroke="url(#gradient)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#6E48AA', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#9D50BB', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Nodes */}
      {layout.nodes.map((node, i) => {
        if (node.isStart) {
          return (
            <div 
              key="start" 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold px-4 py-2 rounded-full z-10" 
              style={{
                left: node.x,
                top: node.y,
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                boxShadow: '0 4px 12px rgba(30,41,59,0.3)'
              }}
            >
              START
            </div>
          );
        }
        if (node.isEnd) {
          return (
            <div 
              key="end" 
              className="absolute text-white font-bold rounded-2xl z-10 text-center flex flex-col items-center" 
              style={{ 
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)',
                width: '320px',
                padding: '24px 28px',
                background: 'linear-gradient(135deg, #6E48AA 0%, #9D50BB 100%)',
                boxShadow: '0 12px 40px rgba(110,72,170,0.5), 0 0 20px rgba(157,80,187,0.3)',
                border: '3px solid rgba(255,255,255,0.4)'
              }}
            >
              <span style={{ fontSize: '42px', marginBottom: '12px' }}>🏆</span>
              <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.5', wordBreak: 'break-word', width: '100%' }}>{node.goalText}</span>
            </div>
          );
        }
        if (node.isMilestone) {
          return (
            <div 
              key={node.id} 
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${node.task.completed ? 'border-purple-300' : 'border-slate-200'} border-2 rounded-xl z-10 flex flex-col items-center text-center transition-all hover:shadow-xl`} 
              style={{ 
                left: node.x, 
                top: node.y,
                width: '200px',
                padding: '14px 18px',
                background: node.task.completed 
                  ? 'linear-gradient(135deg, rgba(110,72,170,0.1) 0%, rgba(157,80,187,0.15) 100%)' 
                  : 'white',
                boxShadow: node.task.completed 
                  ? '0 4px 16px rgba(110,72,170,0.2)' 
                  : '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: node.task.completed ? '#6E48AA' : '#94a3b8', marginBottom: '8px' }}>Week {node.weekNumber}</span>
              <span className={`text-xs font-semibold leading-tight w-full ${node.task.completed ? 'text-purple-700' : 'text-slate-700'}`} style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{node.milestoneText}</span>
            </div>
          );
        }
        return (
          <PathNode 
            key={node.id} 
            node={node} 
            index={i} 
            onClick={onNodeClick} 
          />
        );
      })}
    </div>
  );
}
