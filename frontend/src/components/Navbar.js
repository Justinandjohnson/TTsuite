import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, Spacer, Button } from '@chakra-ui/react';

function Navbar() {
  return (
    <Box bg="gray.100" py={4}>
      <Flex maxW="container.lg" mx="auto" align="center">
        <Link to="/">
          <Button colorScheme="teal" variant="ghost">Home</Button>
        </Link>
        <Spacer />
        <Link to="/queue">
          <Button colorScheme="teal" variant="ghost">Queue</Button>
        </Link>
        <Link to="/tables">
          <Button colorScheme="teal" variant="ghost">Tables</Button>
        </Link>
        <Link to="/scan">
          <Button colorScheme="teal" variant="ghost">Scan QR</Button>
        </Link>
      </Flex>
    </Box>
  );
}

export default Navbar;
