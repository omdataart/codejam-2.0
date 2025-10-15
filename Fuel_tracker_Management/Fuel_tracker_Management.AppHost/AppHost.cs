using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var sql = builder.AddSqlServer("sql")
    .WithHostPort(1433)
    .WithDataVolume("FuelTracker-Sql-data")
    .AddDatabase("FuelTracker");

// Add the API project
builder.AddProject<Projects.API>("api").WithReference(sql).WaitFor(sql);

builder.Build().Run();
