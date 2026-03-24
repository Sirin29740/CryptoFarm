// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CryptoFarm {
    enum PlotStatus {Empty, Unwatered, Growing, Ready}
    struct Plot {
        PlotStatus status;
        uint256 plantTime;
        uint256 croptype;
        uint256 wateredays;
        uint256 lastwatertime;
    }
    mapping(address => Plot[]) public playerPlots;
    function plant(uint256 plotI,uint256 croptype) external{
        require(plotI < playerPlots[msg.sender].length, "Out of bound");
        require(playerPlots[msg.sender][plotI].status == PlotStatus.Empty, "The plot has been planted");
        playerPlots[msg.sender][plotI] = Plot(PlotStatus.Unwatered, block.timestamp, croptype, 0, 0);
    }
    function water(uint256 plotI) external{
        require(plotI < playerPlots[msg.sender].length, "Out of bound");
        require(playerPlots[msg.sender][plotI].status == PlotStatus.Unwatered, "The plot is not unwatered");
        uint256 currentday = block.timestamp/86400;
        uint256 lastWaterday = playerPlots[msg.sender][plotI].lastwatertime/86400;
        require(currentday > lastWaterday, "You have already watered today");
        playerPlots[msg.sender][plotI].status = PlotStatus.Growing;
        playerPlots[msg.sender][plotI].lastwatertime = block.timestamp;
    }
    function seetunwater(uint256 plotI) external{
        Plot storage plot = playerPlots[msg.sender][plotI];
        require(plot.status == PlotStatus.Growing, "It has not been watered");
        uint256 currentday = block.timestamp/86400;
        uint256 lastWaterday = playerPlots[msg.sender][plotI].lastwatertime/86400;
        require(currentday > lastWaterday, "You have already watered today");
        plot.status = PlotStatus.Unwatered;
        plot.wateredays += 1;
    }
    function setready(uint256 plotI) external{
        Plot storage plot = playerPlots[msg.sender][plotI];
        require(plot.wateredays == 3, "Not yet");
        plot.status = PlotStatus.Ready;
    }
    function harvest(uint256 plotI) external{
        require(plotI < playerPlots[msg.sender].length, "Out of bound");
        require(playerPlots[msg.sender][plotI].status == PlotStatus.Ready, "The plot is not ok");
        playerPlots[msg.sender][plotI] = Plot(PlotStatus.Empty, 0, 0, 0, 0);
    }
    function addplot() internal{
        require(playerPlots[msg.sender].length < 100, "Can't add more");
        playerPlots[msg.sender].push(Plot(PlotStatus.Empty,0,0,0,0));
    }
    function joinplot() external{
        require(playerPlots[msg.sender].length == 0, "Already joined");
        for (uint256 i = 0; i < 3; i++){
            addplot();
        }
    }
    function getplots(address player) external view returns (Plot[] memory){
        return playerPlots[player];
    }
} 