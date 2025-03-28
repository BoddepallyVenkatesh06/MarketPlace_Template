"use client";

import { client } from "@/consts/client";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { getNFTs as getNFTs1155 } from "thirdweb/extensions/erc1155";
import { getNFTs as getNFTs721 } from "thirdweb/extensions/erc721";
import { MediaRenderer, useReadContract } from "thirdweb/react";

export function AllNftsGrid() {
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const { nftContract, type, supplyInfo } = useMarketplaceContext();

  const startTokenId = supplyInfo?.startTokenId ?? 0n;
  const totalItems: bigint = supplyInfo
    ? supplyInfo.endTokenId - supplyInfo.startTokenId + 1n
    : 0n;
  const numberOfPages: number = totalItems > 0n 
    ? Number((totalItems + BigInt(itemsPerPage) - 1n) / BigInt(itemsPerPage)) 
    : 0;

  // Generate pages array
  const pages: { start: number; count: number }[] = [];
  if (numberOfPages > 0) {
    for (let i = 0; i < numberOfPages; i++) {
      const currentStartTokenId = startTokenId + BigInt(i * itemsPerPage);
      const remainingItems = totalItems - BigInt(i * itemsPerPage);
      const count = remainingItems < BigInt(itemsPerPage)
        ? Number(remainingItems)
        : itemsPerPage;
      pages.push({ start: Number(currentStartTokenId), count });
    }
  }

  // ✅ Ensure currentPageIndex is within bounds
  const validCurrentPageIndex = Math.min(currentPageIndex, pages.length - 1);
  const currentPage = pages[validCurrentPageIndex] ?? { start: 0, count: 0 };

  const { data: allNFTs, isLoading } = useReadContract(
    type === "ERC1155" ? getNFTs1155 : getNFTs721,
    {
      contract: nftContract,
      start: currentPage.start,
      count: currentPage.count,
    }
  );

  const len = allNFTs?.length ?? 0;
  const columns = Math.min(len, 4); // Responsive grid

  return (
    <>
      <SimpleGrid columns={columns} spacing={4} p={4} mx="auto" mt="20px">
        {isLoading ? (
          <Spinner size="lg" />
        ) : allNFTs && allNFTs.length > 0 ? (
          allNFTs.map((item) => (
            <Box
              key={item.id}
              rounded="12px"
              as={Link}
              href={`/collection/${nftContract.chain.id}/${nftContract.address}/token/${item.id.toString()}`}
              _hover={{ textDecoration: "none" }}
            >
              <Flex direction="column">
                <MediaRenderer client={client} src={item.metadata.image} />
                <Text>{item.metadata?.name ?? "Unknown item"}</Text>
              </Flex>
            </Box>
          ))
        ) : (
          <Box mx="auto">No NFTs Found</Box>
        )}
      </SimpleGrid>

      {numberOfPages > 0 && (
        <Box mx="auto" maxW="700px" mt="20px" px="10px" py="5px" overflowX="auto">
          <Flex direction="row" justifyContent="center" gap="3">
            <Button onClick={() => setCurrentPageIndex(0)} isDisabled={validCurrentPageIndex === 0}>
              <MdKeyboardDoubleArrowLeft />
            </Button>
            <Button
              isDisabled={validCurrentPageIndex === 0}
              onClick={() => setCurrentPageIndex(validCurrentPageIndex - 1)}
            >
              <RiArrowLeftSLine />
            </Button>
            <Text my="auto">
              Page {validCurrentPageIndex + 1} of {pages.length}
            </Text>
            <Button
              isDisabled={validCurrentPageIndex === pages.length - 1}
              onClick={() => setCurrentPageIndex(validCurrentPageIndex + 1)}
            >
              <RiArrowRightSLine />
            </Button>
            <Button
              onClick={() => setCurrentPageIndex(pages.length - 1)}
              isDisabled={validCurrentPageIndex === pages.length - 1}
            >
              <MdKeyboardDoubleArrowRight />
            </Button>
          </Flex>
        </Box>
      )}
    </>
  );
}
