-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estoque" (
    "id" TEXT NOT NULL,
    "sku" TEXT,
    "produto" TEXT NOT NULL,
    "size" TEXT,
    "custo" DOUBLE PRECISION NOT NULL,
    "localizacao" TEXT NOT NULL DEFAULT 'Casa',
    "status" TEXT NOT NULL DEFAULT 'EM ESTOQUE',
    "dataEntrada" TIMESTAMP(3),
    "obs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "size" TEXT,
    "custo" DOUBLE PRECISION NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "lucro" DOUBLE PRECISION NOT NULL,
    "margem" DOUBLE PRECISION NOT NULL,
    "mesAno" TEXT,
    "numPedido" TEXT,
    "estoqueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "USCLOSER" (
    "id" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "size" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "frete" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imposto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoTotal" DOUBLE PRECISION NOT NULL,
    "dataCompra" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COMPRADO',
    "dataChegada" TIMESTAMP(3),
    "tracking" TEXT,
    "obs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "USCLOSER_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CESAR" (
    "id" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "size" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "frete" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imposto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoTotal" DOUBLE PRECISION NOT NULL,
    "dataCompra" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COMPRADO',
    "dataChegada" TIMESTAMP(3),
    "tracking" TEXT,
    "obs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CESAR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComprasBR" (
    "id" TEXT NOT NULL,
    "loja" TEXT,
    "produto" TEXT NOT NULL,
    "size" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "formaPgto" TEXT,
    "dataCompra" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'AGUARDANDO',
    "dataChegada" TIMESTAMP(3),
    "obs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ComprasBR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devolucao" (
    "id" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "size" TEXT,
    "canal" TEXT,
    "numPedido" TEXT,
    "motivo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "data" TIMESTAMP(3),
    "estoqueId" TEXT,
    "vendaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Devolucao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
