import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Flex, Link, Spacer } from '@chakra-ui/react';

function Navbar() {
  return (
    <Box bg="blue.500" px={4} py={3}>
      <Flex alignItems="center">
        <Link as={RouterLink} to="/" color="white" fontWeight="bold" fontSize="lg">
          Home
        </Link>
        <Spacer />
        <Link as={RouterLink} to="/queue" color="white" mr={4}>
          Queue
        </Link>
        <Link as={RouterLink} to="/scan" color="white">
          Scan QR
        </Link>
      </Flex>
    </Box>
  );
}

export default Navbar;
