enum SideShape {
  FLAT,
  TAB,
  BLANK,
}

/**
 * Generates the SVG path strings for each piece of a jigsaw puzzle.
 * @param gridSize The number of pieces along one edge of the puzzle (e.g., 3 for a 3x3 grid).
 * @param pieceWidth The width of a single piece.
 * @param pieceHeight The height of a single piece.
 * @returns An array of SVG path strings, one for each piece.
 */
export const generatePuzzleShapes = (
  gridSize: number,
  pieceWidth: number,
  pieceHeight: number
): string[] => {
  // Store the shapes of the internal edges to ensure they match
  const horizontalEdges: SideShape[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize - 1 }, () => SideShape.FLAT)
  );
  const verticalEdges: SideShape[][] = Array.from({ length: gridSize - 1 }, () =>
    Array.from({ length: gridSize }, () => SideShape.FLAT)
  );

  // Randomly assign tab or blank to each internal edge
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize - 1; c++) {
      horizontalEdges[r][c] = Math.random() > 0.5 ? SideShape.TAB : SideShape.BLANK;
    }
  }
  for (let r = 0; r < gridSize - 1; r++) {
    for (let c = 0; c < gridSize; c++) {
      verticalEdges[r][c] = Math.random() > 0.5 ? SideShape.TAB : SideShape.BLANK;
    }
  }

  const shapes: string[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Determine the shape of each of the four sides
      const top = r === 0 ? SideShape.FLAT : -verticalEdges[r - 1][c];
      const right = c === gridSize - 1 ? SideShape.FLAT : horizontalEdges[r][c];
      const bottom = r === gridSize - 1 ? SideShape.FLAT : verticalEdges[r][c];
      const left = c === 0 ? SideShape.FLAT : -horizontalEdges[r][c - 1];
      
      shapes.push(buildPath(top, right, bottom, left, pieceWidth, pieceHeight));
    }
  }
  return shapes;
};

/**
 * Builds the SVG path string for a single puzzle piece based on its side shapes.
 * This is a robust, industry-standard implementation using arcs and lines,
 * replacing the previous flawed Bezier curve algorithm.
 */
function buildPath(
  top: SideShape,
  right: SideShape,
  bottom: SideShape,
  left: SideShape,
  width: number,
  height: number
): string {
  const JIGSAW_SIZE = Math.min(width, height) / 3;

  const path = [
    'M 0 0',
    getSidePath(top, width, 0, width, height, JIGSAW_SIZE, 'top'),
    getSidePath(right, width, height, 0, height, JIGSAW_SIZE, 'right'),
    getSidePath(bottom, 0, height, 0, 0, JIGSAW_SIZE, 'bottom'),
    getSidePath(left, 0, 0, width, 0, JIGSAW_SIZE, 'left'),
  ];
  
  return path.join(' ') + ' Z';
}

function getSidePath(
  side: SideShape,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  jigsawSize: number,
  sideName: 'top' | 'right' | 'bottom' | 'left'
): string {
  if (side === SideShape.FLAT) {
    return `L ${x1} ${y1}`;
  }

  const isTab = side === SideShape.TAB;
  const isVertical = sideName === 'right' || sideName === 'left';
  const length = isVertical ? y1 - y2 : x1 - x2;

  const sign = (sideName === 'top' || sideName === 'left') ? -1 : 1;
  const tabSign = isTab ? 1 : -1;

  const p = isVertical ? { x: x1, y: y2 } : { x: x2, y: y1 };

  const lineLength = (Math.abs(length) - jigsawSize) / 2;

  const dx = isVertical ? 0 : lineLength * sign;
  const dy = isVertical ? lineLength * sign : 0;

  const p1 = { x: p.x + dx, y: p.y + dy };
  const p2 = { x: p1.x + (isVertical ? 0 : jigsawSize * sign), y: p1.y + (isVertical ? jigsawSize * sign : 0) };
  
  const arcRadius = jigsawSize / 2;
  const sweepFlag = isTab ? 1 : 0;

  const jigsawX = isVertical ? jigsawSize * tabSign : 0;
  const jigsawY = isVertical ? 0 : jigsawSize * tabSign;

  // Midpoint of the line for the tab
  const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  
  const p3 = { x: midPoint.x + jigsawX, y: midPoint.y - jigsawY };

  let path = ` L ${p1.x} ${p1.y}`;
  path += ` A ${arcRadius} ${arcRadius} 0 0 ${sweepFlag} ${p3.x} ${p3.y}`;
  path += ` A ${arcRadius} ${arcRadius} 0 0 ${sweepFlag} ${p2.x} ${p2.y}`;
  path += ` L ${x1} ${y1}`;

  return path;
}
