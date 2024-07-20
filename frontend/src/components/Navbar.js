import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, Spacer, Button, Heading } from '@chakra-ui/react';

function Navbar() {
  return (
    <Box bg="gray.800" py={4} boxShadow="md">
      <Flex maxW="container.xl" mx="auto" align="center" px={4}>
        <Heading size="md" color="white">Table Tennis Queue</Heading>
        <Spacer />
        <Link to="/">
          <Button colorScheme="teal" variant="ghost" mr={2}>Home</Button>
        </Link>
        <Link to="/queue">
          <Button colorScheme="teal" variant="ghost" mr={2}>Queue</Button>
        </Link>
        <Link to="/tables">
          <Button colorScheme="teal" variant="ghost" mr={2}>Tables</Button>
        </Link>
        <Link to="/scan">
          <Button colorScheme="teal" variant="ghost">Scan QR</Button>
        </Link>
      </Flex>
    </Box>
  );
}

export default Navbar;