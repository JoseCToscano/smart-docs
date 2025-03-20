// Helper function to find a node and offset within container based on absolute character offset
export const findNodeAndOffset = (container: HTMLElement, targetOffset: number): { node: Node; offset: number } | null => {
    // Walks through all text nodes in the container and finds the one containing the target offset
    let currentOffset = 0;
    
    const walkNodes = (node: Node): { node: Node; offset: number } | null => {
      // If this is a text node, check if the target offset is within it
      if (node.nodeType === Node.TEXT_NODE) {
        const length = node.textContent?.length ?? 0;
        
        // If the target offset is within this text node, return it
        if (currentOffset <= targetOffset && targetOffset <= currentOffset + length) {
          return {
            node,
            offset: targetOffset - currentOffset
          };
        }
        
        // Otherwise, advance the offset
        currentOffset += length;
        return null;
      }
      
      // Otherwise, recurse into child nodes
      const childNodes = node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        const result = walkNodes(childNodes[i] as Node);
        if (result) {
          return result;
        }
      }
      
      return null;
    };
    
    return walkNodes(container);
  };