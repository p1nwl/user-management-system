import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { FaUnlock, FaTrash } from "react-icons/fa";

interface ToolbarProps {
  selectedCount: number;
  onBlock: () => void;
  onUnblock: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedCount,
  onBlock,
  onUnblock,
  onDelete,
  disabled = false,
}) => {
  const isActionDisabled = disabled || selectedCount === 0;

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div>
        {selectedCount > 0 && (
          <span className="text-muted">{selectedCount} user(s) selected</span>
        )}
      </div>
      <div>
        <ButtonGroup aria-label="User actions">
          <Button
            variant="secondary"
            onClick={onBlock}
            disabled={isActionDisabled}
            className="me-2"
          >
            Block
          </Button>
          <Button
            variant="outline-secondary"
            onClick={onUnblock}
            disabled={isActionDisabled}
            className="me-2 d-flex align-items-center"
          >
            <FaUnlock className="me-1" /> Unblock
          </Button>
          <Button
            variant="outline-danger"
            onClick={onDelete}
            disabled={isActionDisabled}
            className="d-flex align-items-center"
          >
            <FaTrash className="me-1" /> Delete
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default Toolbar;
