import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, VStack } from '@chakra-ui/react';

function AssignPlayerModal({ isOpen, onClose, player, availableTables, onAssign }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Assign {player.name} to a Table</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {availableTables.map(table => (
              <Button key={table.id} onClick={() => onAssign(table.id, player._id)} width="100%">
                Table {table.id}
              </Button>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AssignPlayerModal;